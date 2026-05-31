export function initTheme() {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = stored === "dark" || (!stored && prefersDark);

    // ✅ Use class, not data-theme attribute
    document.documentElement.classList.toggle("dark", isDark);
}

export function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");

    html.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
}

export function getTheme() {
    return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
}
