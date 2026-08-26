<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileUploadRequest;
use Illuminate\Support\Facades\Http;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\TblWidth;
////////////////////////////////
use App\Models\Phone;

class FileController extends Controller
{
    /**
     * Handle the file upload process, forward it to Python, and sync with the database.
     */
    public function upload(FileUploadRequest $request)
    {
        $file = $request->file('file');

        // Forward the file via HTTP POST multipart request to the Python server at 10.166.20.85:5000
        $response = Http::attach(
            'file',
            file_get_contents($file->getRealPath()),
            $file->getClientOriginalName()
        )->post('http://10.166.20.85:5000/api/upload');

        // 1. Unhappy path: Python service is unreachable or errors out
        if (!$response->successful()) {
            return response()->json([
                'message' => 'Не удалось связаться с Python-сервером.',
                'error' => $response->body(),
            ], 500);
        }

        // 2. Happy path: Python service successfully processes the Excel file
        $responseData = $response->json();
        $fileIdsFound = [];

        if (isset($responseData['data']) && is_array($responseData['data'])) {
            foreach ($responseData['data'] as $row) {
                // Sanitize individual row text data
                $cleanData = [
                    'group'     => isset($row['group']) ? strip_tags($row['group']) : '',
                    'person'    => isset($row['person']) ? strip_tags($row['person']) : '',
                    'extension' => isset($row['extension']) ? strip_tags($row['extension']) : '',
                    'phone'     => isset($row['phone']) ? strip_tags($row['phone']) : '',
                    'file_id'   => isset($row['file_id']) ? strip_tags($row['file_id']) : '',
                ];

                if (!empty($cleanData['file_id'])) {
                    $fileIdsFound[] = $cleanData['file_id'];

                    // Create or update record based on file_id
                    Phone::updateOrCreate(
                        ['file_id' => $cleanData['file_id']],
                        [
                            'group'     => $cleanData['group'],
                            'person'    => $cleanData['person'],
                            'extension' => $cleanData['extension'],
                            'phone'     => $cleanData['phone'],
                            'cabinet'   => '',
                            'ip'        => '',
                        ]
                    );
                }
            }

            // Delete records from database that are missing from the uploaded file
            if (!empty($fileIdsFound)) {
                Phone::whereNotIn('file_id', $fileIdsFound)->delete();
            }
        }

        return redirect()->back()->with('message', 'Файл успешно обработан и база данных синхронизирована.');
    }

    public function download()
    {
        // 1. Fetch all phone records
        $phones = Phone::all()->map(function ($phone) {
            return [
                'group'     => $phone->group,
                'person'    => $phone->person,
                'extension' => $phone->extension,
                'phone'     => $phone->phone,
                'cabinet'   => $phone->cabinet ?? '',
                'ip'        => $phone->ip ?? '',
            ];
        });

        // 2. Send the records to your Python microservice endpoint
        $response = Http::timeout(30)->post('http://10.166.20.85:5000/api/download', [
            'phones' => $phones->toArray()
        ]);

        // 3. Throw an exception if Python fails, passing along the error details
        if (!$response->successful()) {
            $errorDetail = $response->json('detail') ?? $response->body();
            throw new \Exception("Python generation failed: " . $errorDetail);
        }

        // 4. Stream the returned Word document back to the browser for download
        $fileName = 'phone_directory.docx';

        return response()->streamDownload(function () use ($response) {
            echo $response->body();
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);
    }
}
