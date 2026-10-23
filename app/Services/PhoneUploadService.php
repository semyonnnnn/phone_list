<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use RuntimeException;
///////////////////////////////////
use App\Repositories\PhoneRepository;
use App\Repositories\DepartmentRepository;

class PhoneUploadService
{
    // Injected by the container; no manual wiring needed.
    public function __construct(private PhoneRepository $phoneRepository, private DepartmentRepository $departmentRepository) {}

    public function upload(UploadedFile $file): void
    {
        $response = Http::attach(
            'file',
            file_get_contents($file->getRealPath()),
            $file->getClientOriginalName()
        )->post('http://10.166.20.85:5000/api/upload');

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

        // Add to the imports: use Illuminate\Support\Facades\DB;

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

    // One place for sanitizing, instead of repeating the isset/strip_tags ternary five times.
    private function clean(mixed $value): string
    {
        // trim() added: the queries no longer call TRIM(), so stray spaces must never reach the database.
        return trim(strip_tags((string) $value));
    }
}
