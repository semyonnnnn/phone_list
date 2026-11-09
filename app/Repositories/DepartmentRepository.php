<?php

namespace App\Repositories;

use App\Models\Department;
use App\Enums\Territory;

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
        $territories = Territory::keys();
        $placeholders = implode(', ', array_fill(0, count($territories), '?'));

        return Department::orderByRaw(
            "FIELD(territory, {$placeholders})",
            $territories
        )
            ->orderByRaw('name = ? DESC', [Department::getFirst()])
            ->orderBy('name')
            ->orderBy('id')
            ->get(['id', 'name', 'territory'])
            ->toArray();
    }

    public function syncByName(array $names, string $territory): array
    {
        $ids = [];

        foreach ($names as $name) {
            $department = Department::where('name', $name)
                ->where('territory', $territory)
                ->first();

            if (!$department) {
                $department = new Department();

                $department->name = $name;
                $department->territory = $territory;


                $department->save();
            }

            $ids[$name] = $department->id;
        }

        return $ids;
    }

    // Used by PhoneService::update() before any write happens.
    // The query uses the column's own collation, so it agrees with the unique index
    // (case, е/ё, and so on). whereKeyNot() lets a department keep its own name.
    public function uniqueBindExists(array $group, ?int $departmentId): bool
    {
        return Department::where('name', $group['name'])->where('territory', $group['territory'])
            ->whereKeyNot($departmentId)
            ->exists();
    }

    public function change(int $departmentId, array $group): void
    {
        Department::whereKey($departmentId)->update(['name' => $group['name'], 'territory' => $group['territory']]);
    }
}
