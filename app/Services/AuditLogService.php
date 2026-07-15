<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogService
{
    public static function log(
        string $action,
        ?string $subjectType = null,
        ?int $subjectId = null,
        array $oldValues = [],
        array $newValues = [],
        ?Request $request = null
    ): void {
        $user = auth()->user();
        $req  = $request ?? request();

        AuditLog::create([
            'user_id'      => $user?->id,
            'username'     => $user?->username,
            'action'       => $action,
            'subject_type' => $subjectType,
            'subject_id'   => $subjectId,
            'old_values'   => $oldValues ?: null,
            'new_values'   => $newValues ?: null,
            'ip_address'   => $req->ip(),
            'user_agent'   => substr($req->userAgent() ?? '', 0, 255),
        ]);
    }
}
