<?php

namespace App\Http\Controllers;

use App\Http\Requests\DepartmentStoreRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function update()
    {
        dd('hi');
    }

    public function store(DepartmentStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Department::create([
            'name' => trim($data['name']),
            'territory' => $data['territory'],
        ]);

        return back()->with('success', 'Отдел успешно создан.');
    }
    public function destroy(int $id)
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return back()->with('success', 'Отдел удалён');
    }
}
