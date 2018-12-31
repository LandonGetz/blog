const version = '20181231104726';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/reflection/2018/12/31/NewYearsEveReflection/","/blood%20ban/lgbtq+/ethics/2018/12/02/BloodBanVsSpermDonation/","/gene%20editing/ethics/law%20&%20policy/2018/11/27/WhyWeAreNotReadyforGeneticEditedBabies/","/blood%20ban/lgbtq+/ethics/law%20&%20policy/2018/10/26/ThickerThanWater/","/privacy/sequencing/ethics/law%20&%20policy/2018/05/11/DNAPrivacyIssuesIE/","/blood%20ban/lgbtq+/ethics/law%20&%20policy/2017/08/24/ReflectionBloodPolicyIE/","/about/","/categories/","/blog/","/","/manifest.json","/assets/search.json","/search/","/assets/styles.css","/redirects.json","/sitemap.xml","/robots.txt","/blog/page2/","/feed.xml","/assets/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
