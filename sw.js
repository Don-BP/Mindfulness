// --- sw.js ---
const CACHE_NAME = 'brainpower-mw-app-v14'; // <--INCREMENTED VERSION AGAIN
const URLS_TO_CACHE = [
    '/',
    'index.html',
    'style.css',
    'app.js',
    'manifest.json',
    'offline.html',
    'images/logo.png',
    'images/icon-192x192.png',
    'images/icon-512x512.png',
    'images/icon-students.png',
    'images/icon-teachers.png',
    'images/icon-resources.png',
    'images/hero-background.jpg',
    'images/mind_puppy_icon.png', 
    'images/shake_freeze_icon.png', 
    'images/amazing_brain_icon.png',
    'images/coloring_mandala.png', // Already present but good to confirm
    'images/coloring_nature.png',  // Already present
    // No specific gratitude_jar.png was in the original, will omit unless specified
    // Placeholders for new page icons (if you create them)
    'images/icon_parents.png', 
    'images/icon_school_pathways.png', 
    'images/icon_research.png', 

    // Audio files
    'audio/quick_calm_1min.mp3',
    'audio/mindful_breathing_3min.mp3',
    'audio/mindful_breathing_5min.mp3',
    'audio/body_scan_10min.mp3',
    'audio/mindful_listening_sounds_3min.mp3',
    'audio/thoughts_as_clouds_5min.mp3',
    'audio/stop_practice_2min.mp3',
    'audio/loving_kindness_5min.mp3',
    'audio/gratitude_reflection_4min.mp3',

    // PDF Resources
    'pdfs/What_Is_Mindfulness_BrainPower.pdf',
    'pdfs/MiSP_MfCP_Overview_BrainPower.pdf',
    'pdfs/BrainPower_MW_Vision.pdf',
    'pdfs/Mindful_Minutes_Guide_ES.pdf',
    'pdfs/Mindful_Minutes_Guide_JHS.pdf',
    'pdfs/Adult_MW_Foundations_Overview.pdf',
    'pdfs/Tips_for_Teaching_Mindfulness.pdf',
    'pdfs/coloring_mandala_printable.pdf', // Already present
    'pdfs/coloring_nature_printable.pdf'  // Already present
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Install event in progress.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Opened cache: ', CACHE_NAME);
                return cache.addAll(URLS_TO_CACHE)
                    .then(() => console.log('[Service Worker] All core assets cached successfully.'))
                    .catch(err => {
                        console.error('[Service Worker] Failed to cache one or more resources during install:', err);
                        URLS_TO_CACHE.forEach(url => {
                            fetch(url, { method: 'HEAD', cache: 'no-store' }) 
                                .then(res => { if (!res.ok) console.error(`[SW Install] Problem with URL: ${url}, Status: ${res.status}`); })
                                .catch(e => console.error(`[SW Install] Network error for URL: ${url}`, e));
                        });
                    });
            })
            .catch(err => {
                console.error('[Service Worker] Failed to open cache during install:', err);
            })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return; 
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(
                    networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    }
                ).catch(error => {
                    console.warn('[Service Worker] Fetch failed for:', event.request.url, error);
                    if (event.request.mode === 'navigate') {
                        return caches.match('offline.html');
                    }
                });
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate event in progress.');
    const cacheWhitelist = [CACHE_NAME]; 
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activated and old caches cleaned.');
            return self.clients.claim(); 
        })
    );
});
// --- END OF FILE sw.js ---