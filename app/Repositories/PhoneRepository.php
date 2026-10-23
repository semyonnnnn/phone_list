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

    // Add to the imports:
    // use App\Models\Department;
    // use Illuminate\Pagination\LengthAwarePaginator;

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
}
