<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/AuditLogs', [
            'logs' => AuditLog::orderByDesc('id')->limit(500)->get(),
        ]);
    }
}
