export function imgProxy(url) {
    if (!url) return null;
    return url;
}

/**
 * onError handler: if proxy fails, try the original URL directly.
 * Usage: <img src={imgProxy(url)} onError={imgFallback} />
 */
export function imgFallback(e) {
    const src = e.currentTarget.src;
    const marker = '/img?url=';
    if (src.includes(marker)) {
        const original = decodeURIComponent(src.split(marker)[1]);
        e.currentTarget.src = original;
    } else {
        e.currentTarget.style.display = 'none';
    }
}
