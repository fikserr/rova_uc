/**
 * Display-only overrides for game shop UI.
 *
 * These do NOT affect data sent to the backend — `activeType` and
 * `product.id`/`product.name` used in API calls always stay the raw
 * values from `/shop/variants`. This file only controls what's shown
 * on screen (type/region tab labels, product names, product images).
 *
 * ── How to edit ──────────────────────────────────────────────────
 * • Rename/relabel a SINGLE product → PRODUCT_OVERRIDES
 * • Rename a WHOLE PATTERN of products (e.g. "N Diamonds (filipina)")
 *   without listing each one → PRODUCT_LABEL_RULES
 * • Give ONE specific product a custom image → add `image` inside its
 *   PRODUCT_OVERRIDES entry (this always wins over everything below)
 * • Give a WHOLE CATEGORY of products a shared default image without
 *   listing each one → PRODUCT_DEFAULT_IMAGES
 * • If nothing matches, the product's own `image_url` from the API is
 *   used (proxied through imgProxy for external CDNs).
 *
 * Priority for labels: PRODUCT_OVERRIDES (exact) → PRODUCT_LABEL_RULES
 * (pattern) → raw name.
 * Priority for images: PRODUCT_OVERRIDES (exact) → PRODUCT_DEFAULT_IMAGES
 * (pattern) → product.image_url (proxied).
 */
import { imgProxy } from "./ImgProxy";

/* ── Region / server tab labels ──────────────────────────────────── */
export const TYPE_LABEL_OVERRIDES = {
    "Mobile Legends": {
        Filipina: "🇵🇭 PH",
        Global: "🌐 Global",
        Russia: "🇷🇺 RU",
        Singapore: "🇸🇬 SG",
        Turkey: "🇹🇷 TR",
        Indonesia: "🇮🇩 ID",
        Brazil: "🇧🇷 BR",
        Malaysia: "🇲🇾 MY",
        Diamonds: "🇺🇿 UZ",
    },
};

/* ── Exact per-product overrides (name and/or image) ──────────────
   Use for products that don't fit a pattern rule below, or that
   need a completely custom label/image regardless of pattern. */
export const PRODUCT_OVERRIDES = {
    "Mobile Legends": {
        "First Top Up 50+5 Diamonds (filipina)": { name: "50💎 Diamonds" },
        "Weekly Diamond Pass (filipina)": { name: "Weekly Diamond Pass" },
        "Twilight Pass (filipina)": { name: "Twilight Pass" },
        "First Top Up": { name: "🎁 First Top Up Bonus" },
        // "raw backend name": { name: "display name", image: "/storage/assets/..." },
    },
    "Pubg Mobile":{}
    // "Another Game": {
    //     "raw backend name": { name: "display name", image: "/storage/assets/..." },
    // },
};

/* ── Pattern-based name rules ──────────────────────────────────────
   Covers whole families of products (e.g. every "N Diamonds
   (filipina)" or "Mobilelegend - N Diamond") without listing each
   one individually. Only used when PRODUCT_OVERRIDES has no exact
   match for that product name. */
const PRODUCT_LABEL_RULES = {
    "Mobile Legends": [
        // "11 Diamonds (filipina)" → "11💎"
        {
            pattern: /^([\d.,]+)\s*Diamonds?\s*\([^)]*\)$/i,
            format: (m) => `${m[1]}💎`,
        },
        // "Mobilelegend - 86 Diamond" → "86💎 Diamonds"
        {
            pattern: /^Mobilelegend\s*-\s*([\d.,]+)\s*Diamonds?$/i,
            format: (m) => `${m[1]} 💎 Diamonds`,
        },
    ],
    // "Mobilelegend - 86 Diamond" → "86💎 Diamonds"
    "Pubg Mobile":[
        {pattern:/^Global\s*([\d.,]+)\s*Uc?$/i, format: (m) => `${m[1]} Uc`},
    ]
    // "Another Game": [
    //     { pattern: /^.../, format: (m) => `...${m[1]}...` },
    // ],
};

function ruleBasedLabel(game, name) {
    const rules = PRODUCT_LABEL_RULES[game];
    if (!rules) return null;
    for (const rule of rules) {
        const match = name.match(rule.pattern);
        if (match) return rule.format(match);
    }
    return null;
}

/* ── Category-wide default images ──────────────────────────────────
   Applies to any product whose name matches, without needing an
   individual PRODUCT_OVERRIDES entry per product. A per-product
   `image` in PRODUCT_OVERRIDES always takes priority over these.

   `match`:   substring(s) the raw product name must contain (any one, case-insensitive)
   `exclude`: substring(s) that disqualify a match even if `match` hits
*/
const PRODUCT_DEFAULT_IMAGES = {
    "Mobile Legends": [
        {
            match: ["diamond"],
            exclude: ["weekly", "pass", "twilight"],
            image: "/storage/assets/diamond.png",
        },
        {
            match: ["weekly"],
            image: "/storage/assets/weekly.png",
        },
        {
            match: ["twilight"],
            image: "/storage/assets/twillight.png",
        },
    ],
    "Pubg Mobile": [
        {
            match: ["uc"],
            exclude: ["royale", "elite",],
            image: "/storage/assets/ucMain.webp",
        },
        {
            match: ["royale"],
            image: "/storage/assets/rp.png",
        },
        {
            match: ["elite"],
            image: "/storage/assets/rpPlus.png",
        },
    ],
    // "Another Game": [
    //     { match: ["gem"], image: "/storage/assets/gem.png" },
    // ],
};

function matchesDefaultRule(name, rule) {
    const lower = name.toLowerCase();
    const isMatch = rule.match.some((m) => lower.includes(m.toLowerCase()));
    if (!isMatch) return false;
    const isExcluded = (rule.exclude ?? []).some((ex) =>
        lower.includes(ex.toLowerCase()),
    );
    return !isExcluded;
}

function defaultProductImage(game, name) {
    const rules = PRODUCT_DEFAULT_IMAGES[game];
    if (!rules) return null;
    const rule = rules.find((r) => matchesDefaultRule(name, r));
    return rule?.image ?? null;
}

/* ── Public helpers ─────────────────────────────────────────────── */

export function typeLabel(game, type) {
    return TYPE_LABEL_OVERRIDES[game]?.[type] ?? type;
}

export function productLabel(game, name) {
    const exact = PRODUCT_OVERRIDES[game]?.[name]?.name;
    if (exact) return exact;

    const ruled = ruleBasedLabel(game, name);
    if (ruled) return ruled;

    return name;
}

export function resolveProductImage(game, product) {
    const override = PRODUCT_OVERRIDES[game]?.[product.name]?.image;
    if (override) return override;

    const fallbackDefault = defaultProductImage(game, product.name);
    if (fallbackDefault) return fallbackDefault;

    return product.image_url ? imgProxy(product.image_url) : null;
}
