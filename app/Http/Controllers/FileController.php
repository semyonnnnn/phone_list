<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileUploadRequest;
use Illuminate\Support\Facades\Http;

class FileController extends Controller
{
    /**
     * Handle the file upload process and forward it to the Python service.
     */
    public function upload(FileUploadRequest $request)
    {
        $file = $request->file('file');

        // Forward the file via HTTP POST multipart request to the server at 10.166.20.85:5000
        $response = Http::attach(
            'file', // Field name expected by your Python script/endpoint
            file_get_contents($file->getRealPath()),
            $file->getClientOriginalName()
        )->post('http://10.166.20.85:5000/api/upload'); // Adjust the endpoint path if it differs

        if ($response->successful()) {
            return response()->json([
                'message' => 'Файл успешно передан и обработан Python-сервером.',
                'data' => $response->json(),
            ], 200);
        }

        return response()->json([
            'message' => 'Не удалось связаться с Python-сервером.',
            'error' => $response->body(),
        ], 500);
    }
}
