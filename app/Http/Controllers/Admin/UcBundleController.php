<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\UcBundle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UcBundleController extends Controller
{
    public function index()
    {
        $bundles = UcBundle::orderBy('sort_order')->orderByDesc('id')->get()->map(function ($b) {
            $b->image_url = $b->image_path ? Storage::disk('public')->url($b->image_path) : null;
            return $b;
        });

        return Inertia::render('Admin/UcBundles', [
            'bundles'    => $bundles,
            'currencies' => Currency::where('is_active', true)->orderBy('code')->get(['code', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'         => 'required|string|max:100',
            'sell_price'    => 'required|numeric|min:0',
            'cost_price'    => 'required|numeric|min:0',
            'cost_currency' => 'required|string',
            'sort_order'    => 'nullable|integer',
            'is_active'     => 'nullable|boolean',
            'image'         => 'nullable|image|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('bundles', 'public');
        }

        UcBundle::create([
            'title'         => $data['title'],
            'sell_price'    => $data['sell_price'],
            'sell_currency' => 'UZS',
            'cost_price'    => $data['cost_price'],
            'cost_currency' => $data['cost_currency'],
            'sort_order'    => (int) ($data['sort_order'] ?? 0),
            'is_active'     => filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'image_path'    => $imagePath,
            'created_at'    => now(),
        ]);

        return redirect()->back()->with('success', "To'plam qo'shildi");
    }

    public function update(Request $request, UcBundle $bundle)
    {
        $data = $request->validate([
            'title'         => 'required|string|max:100',
            'sell_price'    => 'required|numeric|min:0',
            'cost_price'    => 'required|numeric|min:0',
            'cost_currency' => 'required|string',
            'sort_order'    => 'nullable|integer',
            'is_active'     => 'nullable|boolean',
            'image'         => 'nullable|image|max:4096',
        ]);

        $imagePath = $bundle->image_path;
        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('bundles', 'public');
        }

        $bundle->update([
            'title'         => $data['title'],
            'sell_price'    => $data['sell_price'],
            'cost_price'    => $data['cost_price'],
            'cost_currency' => $data['cost_currency'],
            'sort_order'    => (int) ($data['sort_order'] ?? $bundle->sort_order),
            'is_active'     => filter_var($data['is_active'] ?? $bundle->is_active, FILTER_VALIDATE_BOOLEAN),
            'image_path'    => $imagePath,
        ]);

        return redirect()->back()->with('success', "To'plam yangilandi");
    }

    public function destroy(UcBundle $bundle)
    {
        if ($bundle->image_path) {
            Storage::disk('public')->delete($bundle->image_path);
        }
        $bundle->delete();

        return redirect()->back()->with('success', "To'plam o'chirildi");
    }
}
