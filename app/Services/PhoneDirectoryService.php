<?php

namespace App\Services;

use App\Repositories\DepartmentRepository;
use App\Repositories\PhoneRepository;

class PhoneDirectoryService
{
    public function __construct(
        private PhoneRepository $phoneRepository,
        private DepartmentRepository $departmentRepository
    ) {}

    /**
     * Everything the index page needs, except auth and filters (those are HTTP-level).
     */
    public function getPage(?string $search, ?string $department): array
    {

        $paginated = $this->phoneRepository->paginate($search, $department, 15);

        // The rows arrive already ordered, and groupBy keeps first-appearance order,
        // so the departments come out in the right order without sorting again.
        $departments = $paginated
            ->getCollection()
            ->groupBy('group')
            ->map(fn($group) => [
                'group' => [
                    // every phone in the group carries the same department fields, so the first is enough
                    'name'      => $group->first()->group,
                    'territory' => $group->first()->territory,
                ],
                'phones' => $group->values()->all(),
            ])
            ->values()
            ->all();

        return [
            'departments' => $departments,
            'allGroups' => $this->departmentRepository->namesOrdered(),
            'totalDatabaseCount' => $this->phoneRepository->count(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'links' => $paginated->linkCollection(),
                'total' => $paginated->total(),
            ],
        ];
    }
}
