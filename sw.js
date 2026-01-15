const proxyBase = "https://api.codetabs.com/v1/proxy?quest=";

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip the proxy logic for the CodeTabs API itself to avoid infinite loops
    if (url.href.includes('codetabs.com')) return;

    // Logic: Detect if the request is for CroxyProxy or its assets
    if (url.hostname.includes('croxyproxy.com') || url.hostname.includes('google-analytics')) {
        
        // Detect IP Address (The "Back Off" trigger)
        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(url.hostname);

        if (isIP) {
            // Let the request go directly to the proxy server IP
            return;
        }

        // Tunnel everything else through CodeTabs
        const tunneledUrl = proxyBase + encodeURIComponent(event.request.url);
        
        event.respondWith(
            fetch(tunneledUrl, {
                method: event.request.method,
                headers: event.request.headers,
                mode: 'cors'
            }).catch(err => {
                console.error("Tunnel failed:", err);
            })
        );
    }
});
