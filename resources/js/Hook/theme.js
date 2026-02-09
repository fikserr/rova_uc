/**
 * Initialize theme before React mounts
 * Priority:
 * 1. localStorage
 * 2. system preference
 * 3. fallback = light
 */
export function initTheme() {
    const storedTheme = localStorage.getItem("theme");

    let theme = "light";

    if (storedTheme === "dark" || storedTheme === "light") {
        theme = storedTheme;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        theme = "dark";
    }

    document.documentElement.setAttribute("data-theme", theme);
}

/**
 * Toggle between light / dark
 * Persists to localStorage
 */
export function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");

    const next = current === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
}

/**
 * Optional helper
 */
export function getTheme() {
    return document.documentElement.getAttribute("data-theme");
}
