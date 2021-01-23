const version = '1.0'

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
  let cleaned = caches.keys(keys => {
    keys.forEach(key => {
      if (key !== `static-${version}` && key.match('static')) {
        return caches.delete(key)
      }
    })
  })

  e.waitUntil(cleaned)
})

const staticCache = req => {
  return caches.match(req).then(cachedRes => {
    if (cachedRes) {
      return cachedRes
    }

    return fetch(req).then(networkRes => {
      caches.open(`static-${version}`).then(cache => {
        cache.put(req, networkRes)
      })

      return networkRes.clone()
    })
  })
}

self.addEventListener('fetch', e => {
  if (e.request.url.match(location.origin)) {
    e.respondWith(staticCache(e.request))
  }
})

