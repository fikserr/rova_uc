<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SpinSector;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SpinSectorController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SpinSectors', [
            'sectors' => SpinSector::orderBy('id')->get()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string',
            'reward_type'  => 'required|in:balance,pubg,none',
            'reward_value' => 'required|numeric',
            'probability'  => 'required|integer|min:1',
        ]);

        SpinSector::create([
            ...$data,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Spin sector qo‘shildi');
    }

    public function update(Request $request, SpinSector $sector)
    {
        $data = $request->validate([
            'title'        => 'required|string',
            'reward_type'  => 'required|in:balance,pubg,none',
            'reward_value' => 'required|numeric',
            'probability'  => 'required|integer|min:1',
            'is_active'    => 'boolean',
        ]);

        $sector->update($data);

        return redirect()->back()->with('success', 'Spin sector yangilandi');
    }

    public function destroy(SpinSector $sector)
    {
        $sector->delete();

        return redirect()->back()->with('success', 'Spin sector o‘chirildi');
    }
}
