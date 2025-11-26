  import { offlineFallback, warmStrategyCache } from 'workbox-recipes';
  import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
  import { registerRoute, Route } from 'workbox-routing';
  import { CacheableResponsePlugin } from 'workbox-cacheable-response';
  import { ExpirationPlugin } from 'workbox-expiration';

  // configurando o cache
  const pageCache = new CacheFirst({
    cacheName: 'primeira-pwa-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  });

  warmStrategyCache({
    urls: ['/index.html', '/'],
    strategy: pageCache,
  });

  registerRoute(({ request }) => request.mode === 'navigate', pageCache);


  registerRoute(
    ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
    new StaleWhileRevalidate({
      cacheName: 'asset-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  );


  offlineFallback({
    pageFallback: '/offline.html',
  });

  const imageRoute = new Route(({ request }) => {
    return request.destination === 'image';
  }, new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30,
      })
    ]
  }));

  registerRoute(imageRoute);

