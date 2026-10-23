<?php

use Illuminate\Support\Facades\Route;
//////////////////////////////////////////
use App\Http\Controllers\PhoneController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\DepartmentController;

// Publicly accessible main view
Route::get('/', [PhoneController::class, 'index'])->name('phones.index');

// Dedicated Login Routes
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::get('/files/download', [FileController::class, 'download'])->name('files.download');

// Protected REST API routes for table operations (requires authentication)
Route::middleware(['auth'])->group(function () {
    Route::put('/phones', [PhoneController::class, 'update'])->name('phones.update');

    // File Management Routes (both POST, protected by auth)
    Route::post('/files/upload', [FileController::class, 'upload'])->name('files.upload');

    Route::post('/department/update', [DepartmentController::class, 'update'])->name('department.update');
});
