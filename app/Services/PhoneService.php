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

class PhoneService
{
    // Injected by the container; no manual wiring needed.
    public function __construct(
        private PhoneRepository $phoneRepository,
        private DepartmentRepository $departmentRepository,
        private PhoneDirectoryService $directory,
    ) {}

    // Types are `mixed` on purpose: the controller passes $request->input() straight
    // through, exactly as before, so behavior is unchanged.
    public function index(mixed $search, mixed $departmentFilter): array
    {
        return $this->directory->getPage($search, $departmentFilter);
    }

    public function upload(UploadedFile $file): void
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
            $cleanRows[] = [
                'group'     => $this->clean($row['group'] ?? ''),
                'person'    => $this->clean($row['person'] ?? ''),
                'extension' => $this->clean($row['extension'] ?? ''),
                'phone'     => $this->clean($row['phone'] ?? ''),
                'file_id'   => $fileId,
            ];
        }

        // One check is enough now. Before, the two arrays always had the same length, so the second check never added anything.
        if ($cleanRows === []) {
            return;
        }

        // One transaction around all three steps: if the phone sync fails,
        // the departments created in step 1 are rolled back too. The repositories' own
        // transactions nest inside this one without problems.
        DB::transaction(function () use ($cleanRows) {
            // Step 1: every distinct group name becomes a department; we get [name => id] back.
            $names = array_values(array_unique(array_column($cleanRows, 'group')));
            $departmentIds = $this->departmentRepository->syncByName($names);

            // Step 2: build the phone rows, now with the department id looked up by group name.
            $phoneRows = [];
            foreach ($cleanRows as $row) {
                $phoneRows[] = [
                    'department_id' => $departmentIds[$row['group']],
                    'person'        => $row['person'],
                    'extension'     => $row['extension'],
                    'phone'         => $row['phone'],
                    'file_id'       => $row['file_id'],
                ];
            }

            $this->phoneRepository->sync($phoneRows);
        });
    }

    // Takes $validated['departments']. The service never builds an HTTP response;
    // a name clash is thrown as a ValidationException instead.
    public function update(array $departments): void
    {
        // ---- Pre-check group names BEFORE touching the DB ----
        // The unique index on departments.name would make the UPDATE fail with a
        // 500, so ask first and answer with a normal Inertia validation error.
        $nameErrors = [];
        $seenNames = [];           // names claimed so far in THIS payload
        $departmentIdByIndex = []; // reused in the transaction, saves a second lookup

        foreach ($departments as $depIndex => $department) {
            $group = $department['group'] ?? null;
            // The payload has no department id, so find it through the first phone.
            $firstPhoneId = $department['phones'][0]['id'] ?? null;

            if (empty($group) || !$firstPhoneId) {
                continue;
            }

            $departmentId = $this->phoneRepository->departmentIdOf($firstPhoneId);
            $departmentIdByIndex[$depIndex] = $departmentId;

            // Taken by ANOTHER department in the DB.
            $takenInDb = $this->departmentRepository->nameTakenByAnother($group, $departmentId);

            // Two departments renamed to the same name in one save. The DB can't see
            // this yet, because neither rename has been written. mb_strtolower is only
            // an approximation of the collation; the unique index stays the backstop.
            $key = mb_strtolower($group);
            $takenInPayload = isset($seenNames[$key]);
            $seenNames[$key] = true;

            if ($takenInDb || $takenInPayload) {
                // Key = the form's error-bag path, so useForm().errors exposes it
                // at errors['departments.{index}.group'] and the card can show it.
                $nameErrors["departments.{$depIndex}.group"] = "Отдел с названием «{$group}» уже существует.";
            }
        }

        // Nothing has been written yet, so nothing needs rolling back.
        if (!empty($nameErrors)) {
            throw ValidationException::withMessages($nameErrors);
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
                    // clean() returns '' for null or empty input. The columns are
                    // nullable and used to get null, so '' is turned back into null
                    // here instead of silently storing empty strings.
                    $cabinet = $this->clean($phoneData['cabinet'] ?? null);
                    $ip      = $this->clean($phoneData['ip'] ?? null);
                    $person  = $this->clean($phoneData['person'] ?? null);
                    $phone  = $this->clean($phoneData['phone'] ?? null);
                    $extension  = $this->clean($phoneData['extension'] ?? null);


                    $this->phoneRepository->updateEditable(
                        $phoneData['id'],
                        $cabinet === '' ? null : $cabinet,
                        $ip === '' ? null : $ip,
                        (bool) ($phoneData['isMiniBoss'] ?? false),
                        $person === '' ? null : $person,
                        $phone === '' ? null : $phone,
                        $extension === '' ? null : $extension,
                    );
                }

                // Rename, reusing the id found in the pre-check.
                if (!empty($group) && isset($departmentIdByIndex[$depIndex])) {
                    $this->departmentRepository->rename($departmentIdByIndex[$depIndex], $group);
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
