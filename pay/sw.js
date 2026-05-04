self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

self.addEventListener('paymentrequest',event=>{
 event.respondWith((async()=>{
   await self.clients.openWindow('/pay/navigate.html');
   return {
     methodName:'cardpay.com',
     details:{status:'ok'}
   };
 })());
});
