<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\FileController;
use Illuminate\Support\Facades\Route;

// Publicly accessible dashboard view
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// Dedicated Login Routes
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

// Protected REST API routes for table operations (requires authentication)
Route::middleware(['auth'])->group(function () {
    Route::post('/phones', [DashboardController::class, 'store']);
    Route::put('/phones/{phone}', [DashboardController::class, 'update']);
    Route::delete('/phones/{phone}', [DashboardController::class, 'destroy']);

    // File Management Routes (both POST, protected by auth)
    Route::post('/files/upload', [FileController::class, 'upload'])->name('files.upload');
    Route::post('/files/download', [FileController::class, 'download'])->name('files.download');
});
