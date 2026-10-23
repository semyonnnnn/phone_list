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
            ->map(fn($items, $groupName) => [
                'group' => $groupName,
                'phones' => $items->values()->all(),
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
