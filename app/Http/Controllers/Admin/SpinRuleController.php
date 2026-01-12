<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SpinRule;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SpinRuleController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SpinRules', [
            'rules' => SpinRule::orderBy('min_total_deposit')->get()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'min_total_deposit' => 'required|numeric|min:0',
            'spins_count'       => 'required|integer|min:1',
        ]);

        SpinRule::create([
            ...$data,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Spin qoida qo‘shildi');
    }

    public function update(Request $request, SpinRule $rule)
    {
        $data = $request->validate([
            'min_total_deposit' => 'required|numeric|min:0',
            'spins_count'       => 'required|integer|min:1',
            'is_active'         => 'boolean',
        ]);

        $rule->update($data);

        return redirect()->back()->with('success', 'Spin qoida yangilandi');
    }

    public function destroy(SpinRule $rule)
    {
        $rule->delete();

        return redirect()->back()->with('success', 'Spin qoida o‘chirildi');
    }
}
