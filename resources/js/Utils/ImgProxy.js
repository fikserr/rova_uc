/**
 * Returns a proxied URL for external images (e.g. SekalıPay CDN).
 * Local paths and data URIs are returned as-is.
 */
export function imgProxy(url) {
    if (!url) return null;
    if (
        url.startsWith("/") ||
        url.startsWith("data:") ||
        url.startsWith("blob:")
    )
        return url;
    return `/img?url=${encodeURIComponent(url)}`;
}
