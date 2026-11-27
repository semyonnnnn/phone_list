<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use RuntimeException;
///////////////////////////////////
use App\Repositories\PhoneRepository;
use App\Repositories\DepartmentRepository;
use App\Models\Department;

class PhoneService
{
    // Injected by the container; no manual wiring needed.
    public function __construct(
        private PhoneRepository $phoneRepository,
        private DepartmentRepository $departmentRepository,
    ) {}

    // Types are `mixed` on purpose: the controller passes $request->input() straight
    // through, exactly as before, so behavior is unchanged.
    public function index(mixed $search, mixed $department, string $territory): array
    {

        $paginated = $this->phoneRepository->paginate($search, $department, $territory, 15);

        // The rows arrive already ordered, and groupBy keeps first-appearance order,
        // so the departments come out in the right order without sorting again.
        $departments = $paginated
            ->getCollection()
            ->groupBy('department_id')
            ->map(fn($group) => [
                'group' => [
                    'id'        => $group->first()->department_id,
                    'name'      => $group->first()->group,
                    'territory' => $group->first()->territory,
                ],
                'phones' => $group->filter(fn($row) => $row->id !== null)->values()->all(),
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

    public function upload(UploadedFile $file, string $territory): void
    {
        $response = Http::attach(
            'file',
            file_get_contents($file->getRealPath()),
            $file->getClientOriginalName()
        )->post('http://python:5000/files/upload');

        // The service throws instead of returning JSON: building an HTTP response is the controller's job.
        // The body goes into the message so the controller can pass it along like before.
        if (!$response->successful()) {
            throw new RuntimeException($response->body());
        }

        $rows = $response->json('data');

        // Same behavior as before: no 'data' key means do nothing, and especially delete nothing.
        if (!is_array($rows)) {
            return;
        }

        $cleanRows = [];

        foreach ($rows as $row) {
            $fileId = $this->clean($row['file_id'] ?? '');

            if (empty($fileId)) {
                continue;
            }

            // One array per row again, with the group kept next to the person.
            // That pairing is exactly what the previous version lost by splitting them into two arrays.
            $extension = $this->clean($row['extension'] ?? '');

            $cleanRows[] = [
                'group'     => $this->clean($row['group'] ?? ''),
                'person'    => $this->clean($row['person'] ?? ''),
                'extension' => $extension !== '' ? $extension : null,
                'phone'     => $this->clean($row['phone'] ?? ''),
                'file_id'   => $fileId,
            ];
        }

        // One check is enough now. Before, the two arrays always had the same length, so the second check never added anything.
        if ($cleanRows === []) {
            return;
        }

        DB::transaction(function () use ($cleanRows, $territory) {
            // Step 1: collect distinct, non-empty group names (keyed by name = de-duplication).
            $names = [];
            foreach ($cleanRows as $row) {
                if ($row['group'] !== '') {
                    $names[$row['group']] = $row['group'];
                }
            }
            $names = array_values($names);

            $departmentIds = $this->departmentRepository->syncByName($names, $territory);

            // Step 2: build the phone rows with the department id looked up by group name.
            $phoneRows = [];
            foreach ($cleanRows as $row) {
                if ($row['group'] === '') {
                    continue;
                }

                $phoneRows[] = [
                    'department_id' => $departmentIds[$row['group']],
                    'person'        => $row['person'],
                    'extension'     => $row['extension'],
                    'phone'         => $row['phone'],
                    'file_id'       => $row['file_id'],
                ];
            }

            $this->phoneRepository->sync($phoneRows, $territory);

            // Step 3: remove any department in this territory that has no phones referencing it.
            Department::where('territory', $territory)
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('phones')
                        ->whereColumn('phones.department_id', 'departments.id');
                })
                ->delete();
        });
    }

    // Takes $validated['departments']. The service never builds an HTTP response;
    // a name clash is thrown as a ValidationException instead.
    public function update(array $departments): void
    {
        $nameErrors = [];
        $phoneErrors = [];
        $seenNames = [];
        $seenPhoneExt = [];
        $departmentIdByIndex = [];

        // Collect all phone IDs being updated in this batch so DB checks
        // don't falsely conflict with rows that are being overwritten right now.
        $payloadPhoneIds = collect($departments)
            ->pluck('phones')
            ->flatten(1)
            ->pluck('id')
            ->filter()
            ->all();

        foreach ($departments as $depIndex => $department) {
            $group = $department['group'] ?? null;
            $firstPhoneId = $department['phones'][0]['id'] ?? null;

            if (!empty($group) && $firstPhoneId) {
                $departmentId = $this->phoneRepository->departmentIdOf($firstPhoneId);
                $departmentIdByIndex[$depIndex] = $departmentId;

                $takenInDb = $this->departmentRepository->uniqueBindExists($group, $departmentId);
                $key = mb_strtolower($group['name']) . '|' . strtolower($group['territory']);
                $takenInPayload = isset($seenNames[$key]);
                $seenNames[$key] = true;

                if ($takenInDb || $takenInPayload) {
                    $nameErrors["departments.{$depIndex}.group"] = "Отдел с названием «{$group['name']}» уже существует.";
                }
            }

            foreach ($department['phones'] ?? [] as $phoneIndex => $phoneData) {
                $phoneId   = $phoneData['id'] ?? null;
                $phone     = $this->clean($phoneData['phone'] ?? null);
                $extension = $this->clean($phoneData['extension'] ?? null);

                if (!$phoneId || $phone === '') {
                    continue;
                }

                $pairKey = mb_strtolower($phone) . '|' . mb_strtolower($extension);
                $takenInPayload = isset($seenPhoneExt[$pairKey]);
                $seenPhoneExt[$pairKey] = true;

                $existsInDb = \App\Models\Phone::where('phone', $phone)
                    ->when(
                        $extension === '',
                        fn($q) => $q->whereNull('extension'),
                        fn($q) => $q->where('extension', $extension)
                    )
                    ->whereNotIn('id', $payloadPhoneIds)
                    ->exists();

                if ($existsInDb || $takenInPayload) {
                    $phoneErrors["departments.{$depIndex}.phones.{$phoneIndex}.phone"] = $extension !== ''
                        ? "Телефон '{$phone}' с добавочным '{$extension}' уже существует."
                        : "Телефон '{$phone}' уже существует.";
                }
            }
        }

        $allErrors = array_merge($nameErrors, $phoneErrors);
        if (!empty($allErrors)) {
            throw ValidationException::withMessages($allErrors);
        }

        DB::transaction(function () use ($departments, $departmentIdByIndex) {
            $selectedBossIds = collect($departments)
                ->pluck('phones')
                ->flatten(1)
                ->filter(fn($phoneData) => !empty($phoneData['isBoss']))
                ->pluck('id')
                ->values();

            foreach ($departments as $depIndex => $department) {
                $phones = $department['phones'] ?? [];
                $group  = $department['group'] ?? null;

                if (empty($phones)) {
                    continue;
                }

                foreach ($phones as $phoneData) {
                    $cabinet   = $this->clean($phoneData['cabinet'] ?? null);
                    $ip        = $this->clean($phoneData['ip'] ?? null);
                    $person    = $this->clean($phoneData['person'] ?? null);
                    $phone     = $this->clean($phoneData['phone'] ?? null);
                    $extension = $this->clean($phoneData['extension'] ?? null);
                    $position  = $this->clean($phoneData['position'] ?? null);
                    $comment   = $this->clean($phoneData['comment'] ?? null);

                    $this->phoneRepository->updateEditable(
                        $phoneData['id'],
                        $cabinet === '' ? null : $cabinet,
                        $ip === '' ? null : $ip,
                        (bool) ($phoneData['isMiniBoss'] ?? false),
                        $person === '' ? null : $person,
                        $phone === '' ? null : $phone,
                        $extension === '' ? null : $extension,
                        $position === '' ? null : $position,
                        $comment === '' ? null : $comment,
                    );
                }

                // Rename, reusing the id found in the pre-check.
                if (!empty($group) && isset($departmentIdByIndex[$depIndex])) {
                    $this->departmentRepository->change($departmentIdByIndex[$depIndex], $group);
                }
            }

            foreach ($selectedBossIds as $bossId) {
                $this->phoneRepository->setBoss($bossId);
            }
        });
    }


    // One place for sanitizing, used by both upload() and update().
    private function clean(mixed $value): string
    {
        // trim() added: the queries no longer call TRIM(), so stray spaces must never reach the database.
        return trim(strip_tags((string) $value));
    }
}
