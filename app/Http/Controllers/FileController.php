<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileUploadRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;
////////////////////////////////
use App\Models\Phone;
use App\Services\PhoneService;

class FileController extends Controller
{
    public function upload(FileUploadRequest $request, PhoneService $service)
    {
        //! TODO: change this
        try {
            $service->upload($request->file('file'), 'ЕКБ');
        } catch (RuntimeException $e) {
            // Same JSON response as before, so frontend behavior doesn't change.
            return response()->json([
                'message' => 'Не удалось связаться с Python-сервером.',
                'error' => $e->getMessage(),
            ], 500);
        }

        return redirect()->back()->with('success', 'Файл успешно обработан и база данных синхронизирована.');
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
                'isBoss'    => $phone->isBoss,
                'isMiniBoss' => $phone->isMiniBoss,
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
