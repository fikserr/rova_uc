<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\UserTodo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserTodoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $todos = $user
            ? $user->todos()->orderByDesc('created_at')->get()
            : collect();

        return Inertia::render('User/UserTasks', [
            'todos' => $todos,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return back()->withErrors(['auth' => 'Avtorizatsiya kerak']);
        }

        $request->validate(['title' => 'required|string|max:500']);

        $user->todos()->create([
            'title' => $request->input('title'),
            'is_completed' => false,
        ]);

        return redirect()->route('user-tasks.index');
    }

    public function toggle(Request $request, UserTodo $todo)
    {
        $user = $request->user();
        if (! $user || $todo->user_id != $user->id) {
            return back()->withErrors(['auth' => 'Ruxsat yo\'q']);
        }

        $todo->update(['is_completed' => ! $todo->is_completed]);

        return redirect()->route('user-tasks.index');
    }

    public function destroy(Request $request, UserTodo $todo)
    {
        $user = $request->user();
        if (! $user || $todo->user_id != $user->id) {
            return back()->withErrors(['auth' => 'Ruxsat yo\'q']);
        }

        $todo->delete();

        return redirect()->route('user-tasks.index');
    }
}
