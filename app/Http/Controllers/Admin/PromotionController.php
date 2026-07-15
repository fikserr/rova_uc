<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Promotions', [
            'promotions' => Promotion::orderByDesc('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:100',
            'description'      => 'nullable|string|max:500',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'applies_to'       => 'required|in:all,uc,service,sekali',
            'starts_at'        => 'required|date',
            'ends_at'          => 'required|date|after:starts_at',
            'banner_color'     => 'nullable|string|max:20',
        ]);
        Promotion::create($data);
        return back()->with('success', 'Aksiya yaratildi');
    }

    public function update(Request $request, Promotion $promotion)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:100',
            'description'      => 'nullable|string|max:500',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'applies_to'       => 'required|in:all,uc,service,sekali',
            'starts_at'        => 'required|date',
            'ends_at'          => 'required|date|after:starts_at',
            'banner_color'     => 'nullable|string|max:20',
            'is_active'        => 'boolean',
        ]);
        $promotion->update($data);
        return back()->with('success', 'Yangilandi');
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();
        return back()->with('success', "O'chirildi");
    }

    public function toggle(Promotion $promotion)
    {
        $promotion->update(['is_active' => !$promotion->is_active]);
        return back();
    }
}
