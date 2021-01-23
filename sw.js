const version = '1.3'

const appAssets = [
  'index.html',
  'main.js',
  'images/flame.png',
  'images/logo.png',
  'images/sync.png',
  'vendor/bootstrap.min.css',
  'vendor/jquery.min.js'
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(`static-${version}`).then(cache => cache.addAll(appAssets)))
})

self.addEventListener('activate', e => {
  let cleaned = caches.keys().then(keys => {
    keys.forEach(key => {
      if (key !== `static-${version}` && key.match('static-')) {
        return caches.delete(key)
      }
    })
  })

  e.waitUntil(cleaned)
})

const staticCache = (req, cacheName = `static-${version}`) => {
  return caches.match(req).then(cachedRes => {
    if (cachedRes) {
      return cachedRes
    }

    return fetch(req).then(networkRes => {
      caches.open(cacheName).then(cache => {
        cache.put(req, networkRes)
      })

      return networkRes.clone()
    })
  })
}

const fallbackCache = req => {
  return fetch(req).then(networkRes => {
    if (!networkRes.ok) {
      throw 'Fetch error'
    }

    caches.open(`static-${version}`).then(cache => {
      cache.put(req, networkRes)
    })

    return networkRes.clone()
  })
  .catch(err => caches.match(req))
}

self.addEventListener('fetch', e => {
  if (e.request.url.match(location.origin)) {
    e.respondWith(staticCache(e.request))
  } else if (e.request.url.match('api.giphy.com/v1/gifs/trending')) {
    e.respondWith(fallbackCache(e.request))
  } else if (e.request.url.match('giphy.com/media')) {
    e.respondWith(staticCache(e.request, 'giphy'))
  }
})

