/* Publication data can outlive its delivery domain (and HTTP cache entries).
   Resolve our static references against the manifest that supplied them.
   External media URLs and relay routes keep their original origin. */
globalThis.PublishedAssets={
 url(reference,manifestURL){
  const base=new URL(manifestURL,globalThis.location?.href),url=new URL(reference,base);
  const historical=['https://mosh-canopy-assets.moshcanopy.workers.dev','https://pub-fd77318b30094f8a923cae6a232a72fa.r2.dev'];
  if(url.pathname.startsWith('/assets/')&&historical.includes(url.origin)){
   return new URL(url.pathname+url.search+url.hash,base).href;
  }
  return url.href;
 }
};
