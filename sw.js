// sw.js - The Interceptor
importScripts('https://js.puter.com/v2/');

const PROXY_URL = 'https://fetch.puter.net/proxy?url=';

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Don't proxy requests to our own UI or the Puter library
    if (url.origin === self.location.origin || url.href.includes('puter.com')) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                // Use Puter to bypass CORS
                const response = await puter.net.fetch(event.request.url);
                
                // If it's HTML, we need to inject our proxy script so sub-resources also get proxied
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    let text = await response.text();
                    // Basic injection to keep the service worker active in the iframe
                    const injectedCode = `<script>
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.register('/sw.js');
                        }
                    </script>`;
                    text = text.replace('<head>', '<head>' + injectedCode);
                    return new Response(text, { headers: response.headers });
                }

                return response;
            } catch (err) {
                return new Response('Proxy Error: ' + err.message, { status: 500 });
            }
        })()
    );
});
