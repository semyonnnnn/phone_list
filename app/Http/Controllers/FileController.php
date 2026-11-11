<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use RuntimeException;
////////////////////////////////
use App\Models\Phone;
use App\Services\PhoneService;
use App\Http\Requests\FileUploadRequest;

class FileController extends Controller
{
    public function upload(FileUploadRequest $r, PhoneService $service)
    {
        try {
            $service->upload($r->file('file'), $r->territory);
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
        $phones = Phone::query()
            ->join('departments', 'departments.id', '=', 'phones.department_id')
            ->select(
                'phones.*',
                'departments.name as group',
                'departments.id as department_id',   // grouping key for Python
                'departments.territory as territory' // 'ekb' / 'krg', used to tell same-named departments apart
            )
            ->orderBy('phones.id') // stable row order inside each table
            ->get()
            ->map(function ($phone) {
                return [
                    'department_id' => $phone->department_id,
                    'territory'     => $phone->territory,
                    'group'         => $phone->group,
                    'person'        => $phone->person,
                    'extension'     => $phone->extension,
                    'phone'         => $phone->phone,
                    'cabinet'       => $phone->cabinet ?? '',
                    'ip'            => $phone->ip ?? '',
                    'isBoss'        => (bool) ($phone->is_boss ?? $phone->isBoss),
                    'isMiniBoss'    => (bool) ($phone->is_miniboss ?? $phone->isMiniBoss),
                ];
            });

        $response = Http::timeout(30)->post('http://python:5000/files/download', [
            'phones' => $phones->toArray(),
        ]);

        if (! $response->successful()) {
            $errorDetail = $response->json('detail') ?? $response->body();
            throw new \Exception("Python generation failed: " . $errorDetail);
        }

        return response()->streamDownload(function () use ($response) {
            echo $response->body();
        }, 'phone_directory.docx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);
    }
}
