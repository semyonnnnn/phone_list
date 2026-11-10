<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
///////////////////////////////////////////////
use App\Models\Phone;
use App\Models\Department;
use App\Enums\Territory;

class PhoneRepository
{
    /**
     * Make the phones table match the given rows exactly:
     * insert new, update existing, delete everything else.
     */
    // $territory scopes both the lookup and the delete to one territory,
    // so uploading 'krg' can never touch 'ekb'.
    public function sync(array $rows, string $territory): void
    {
        DB::transaction(function () use ($rows, $territory) {
            // Ids of every department in this territory. PhoneService creates the departments
            // before calling sync(), so the ones from this very upload are already included.
            $territoryDepartmentIds = Department::where('territory', $territory)->pluck('id');

            foreach ($rows as $row) {
                // Look for this file_id only among phones of THIS territory. Matching on
                // file_id alone is what pulled the other territory's phones into this upload.
                // Matching by territory (not by department) also means a person who moved to
                // another department of the same territory is updated, not duplicated.
                $phone = Phone::where('file_id', $row['file_id'])
                    ->whereIn('department_id', $territoryDepartmentIds)
                    ->first();

                if ($phone) {
                    // Same four columns as before, so cabinet, ip and the boss flags
                    // edited in the app survive a re-upload.
                    $phone->update([
                        'department_id' => $row['department_id'],
                        'person'        => $row['person'],
                        'extension'     => $row['extension'],
                        'phone'         => $row['phone'],
                    ]);
                } else {
                    Phone::create([
                        'file_id'       => $row['file_id'],
                        'department_id' => $row['department_id'],
                        'person'        => $row['person'],
                        'extension'     => $row['extension'],
                        'phone'         => $row['phone'],
                    ]);
                }
            }

            // Delete only phones of THIS territory that are no longer in the file.
            // Still relies on the service never passing an empty array (it returns early then).
            Phone::whereNotNull('file_id')
                ->whereIn('department_id', $territoryDepartmentIds)
                ->whereNotIn('file_id', array_column($rows, 'file_id'))
                ->delete();
        });
    }

    public function count(): int
    {
        return Phone::count();
    }

    /**
     * One page of phones, each with its department name available as `group`.
     */
    public function paginate(?string $search, ?string $department, ?string $territory, int $perPage): LengthAwarePaginator
    {
        $query = Phone::query()
            ->join('departments', 'departments.id', '=', 'phones.department_id')
            ->select('phones.*', 'departments.name as group', 'departments.territory as territory');

        // 'all' is not a stored value, so it must never reach a where().
        // 'ekb' / 'krg' add a condition, 'all' (or null) adds nothing, which means
        // rows from both territories come back. Territory::keys() is the whitelist:
        // the FormRequest already enforced it, this is just the "is it a real
        // territory?" check, so a future 'all'-like value can't leak into SQL.
        if ($territory !== null && in_array($territory, Territory::keys(), true)) {
            $query->where('departments.territory', $territory);
        }

        $territories = Territory::keys();
        $placeholders = implode(', ', array_fill(0, count($territories), '?'));

        $query
            ->orderByRaw("FIELD(departments.territory, {$placeholders})", $territories)
            ->orderByRaw('departments.territory = ? DESC', [Department::getFirst()])
            ->orderByRaw('departments.name = ? DESC', [Department::getFirst()])
            ->orderBy('departments.name')
            ->orderBy('departments.id');

        if ($search) {
            $term = '%' . trim($search) . '%';

            $query->where(function ($q) use ($term) {
                $q->where('phones.person', 'like', $term)
                    ->orWhere('phones.phone', 'like', $term)
                    ->orWhere('departments.name', 'like', $term);
            });
        } elseif ($department && $department !== 'Все отделы') {
            $query->where('departments.name', trim($department));
        }

        return $query->paginate($perPage)->withQueryString();
    }

    // Used by PhoneService::update() to find a card's department through its first
    // phone, because the payload carries no department id.
    public function departmentIdOf(int $phoneId): ?int
    {
        $id = Phone::whereKey($phoneId)->value('department_id');

        // value() can return a numeric string depending on the PDO setup,
        // so cast explicitly instead of relying on PHP's coercion.
        return $id === null ? null : (int) $id;
    }

    // The only columns the user edits by hand. isBoss is written by setBoss() below.
    public function updateEditable(
        int $id,
        ?string $cabinet,
        ?string $ip,
        bool $isMiniBoss,
        ?string $person,
        ?string $phone,
        ?string $extension
    ): void {
        Phone::whereKey($id)->update([
            'cabinet'    => $cabinet,
            'ip'         => $ip,
            'isMiniBoss' => $isMiniBoss,
            'person' => $person,
            'phone' => $phone,
            'extension' => $extension,
        ]);
    }

    public function setBoss(int $bossId): void
    {
        $departmentId = $this->departmentIdOf($bossId);

        // Reset the whole department in the DB, not just the payload, because
        // an active search means the payload may not include the old boss.
        Phone::where('department_id', $departmentId)->update(['isBoss' => false]);
        Phone::whereKey($bossId)->update(['isBoss' => true]);
    }
}
