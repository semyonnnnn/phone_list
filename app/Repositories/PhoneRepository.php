<?php

namespace App\Repositories;

use App\Models\Phone;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Department;

class PhoneRepository
{
    /**
     * Make the phones table match the given rows exactly:
     * insert new, update existing, delete everything else.
     */
    public function sync(array $rows): void
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $row) {
                Phone::updateOrCreate(
                    // file_id is the lookup key: find the record by it, or create one with it.
                    ['file_id' => $row['file_id']],
                    // Every column this repository writes is listed here.
                    [
                        'department_id' => $row['department_id'],
                        'person'        => $row['person'],
                        'extension'     => $row['extension'],
                        'phone'         => $row['phone'],
                    ]
                );
            }

            // Still relies on the service never passing an empty array (it returns early in that case).
            Phone::whereNotNull('file_id')
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
    public function paginate(?string $search, ?string $department, int $perPage): LengthAwarePaginator
    {
        $query = Phone::query()
            ->join('departments', 'departments.id', '=', 'phones.department_id')
            ->select('phones.*', 'departments.name as group');

        if ($search) {
            // No mb_strtolower and no LOWER(): LIKE on a _ci column is already case-insensitive for Cyrillic.
            $term = '%' . trim($search) . '%';

            $query->where(function ($q) use ($term) {
                $q->where('phones.person', 'like', $term)
                    ->orWhere('phones.phone', 'like', $term)
                    ->orWhere('departments.name', 'like', $term);
            });
        } elseif ($department && $department !== 'Все отделы') {
            // Plain "=": the collation makes it case-insensitive. Search still wins over this filter (elseif).
            $query->where('departments.name', trim($department));
        }

        // The only raw SQL left. `name = ?` evaluates to 1 for Руководство and 0 for everything else,
        // so DESC puts it first. Because the column is _ci, the case of the stored name doesn't matter.
        // It replaces the old CASE WHEN LOWER(TRIM(...)) block.
        $query->orderByRaw('departments.name = ? DESC', [Department::getFirst()])
            ->orderBy('departments.name');

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
