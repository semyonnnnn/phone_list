<?php

namespace App\Repositories;

use App\Models\Department;

class DepartmentRepository
{
    /**
     * Make sure a department exists for every name, and return [name => id].
     * The service needs the ids to link each phone row to its department.
     */
    public function resolveFileNames(array $fileNames): array
    {
        $ids = [];

        foreach ($fileNames as $fileName) {
            // 1st: a department already linked to this file string, even if you renamed it since.
            // 2nd: a department whose display name equals it (e.g. made by hand with the same name).
            $department = Department::where('file_name', $fileName)->first()
                ?? Department::where('name', $fileName)->first();

            if ($department) {
                // Link it to the file string. `name` is not touched, so hand renames survive uploads.
                $department->update(['file_name' => $fileName]);
            } else {
                $department = Department::create(['name' => $fileName, 'file_name' => $fileName]);
            }

            $ids[$fileName] = $department->id;
        }

        return $ids;
    }

    public function namesOrdered(): array
    {
        // Same trick as in paginate(), so the dropdown and the page list agree on the order.
        return Department::orderByRaw('name = ? DESC', [Department::getFirst()])
            ->orderBy('name')
            ->pluck('name')
            ->all();
    }

    public function syncByName(array $names): array
    {
        $ids = [];

        foreach ($names as $name) {
            // Finds a department by name (case-insensitive because of the _ci column), or creates it.
            $ids[$name] = Department::firstOrCreate(['name' => $name])->id;
        }

        return $ids;
    }

    // Used by PhoneService::update() before any write happens.
    // The query uses the column's own collation, so it agrees with the unique index
    // (case, е/ё, and so on). whereKeyNot() lets a department keep its own name.
    public function nameTakenByAnother(string $name, ?int $departmentId): bool
    {
        return Department::where('name', $name)
            ->whereKeyNot($departmentId)
            ->exists();
    }

    public function rename(int $departmentId, string $name): void
    {
        Department::whereKey($departmentId)->update(['name' => $name]);
    }
}
