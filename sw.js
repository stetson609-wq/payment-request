// CardPay Payment Request Service Worker

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle canmakepayment
self.addEventListener('canmakepayment', (event) => {
  console.log('canmakepayment event received');
  event.respondWith(Promise.resolve(true));
});

// Handle paymentrequest
self.addEventListener('paymentrequest', async (event) => {
  console.log('paymentrequest event received');
  
  let paymentResolver = null;
  let paymentRejecter = null;
  
  const paymentResponsePromise = new Promise((resolve, reject) => {
    paymentResolver = resolve;
    paymentRejecter = reject;
  });
  
  event.respondWith(paymentResponsePromise);
  
  try {
    const client = await event.openWindow('./pay/navigate.html');
    
    if (!client) {
      paymentRejecter('Failed to open payment window');
      return;
    }
    
    const methodData = event.methodData[0];
    const data = methodData?.data || {};
    let urlToOpen = data.url || 'https://cardpay.com';
    
    if (!urlToOpen.startsWith('https://')) {
      console.warn('URL must be HTTPS, adding:', urlToOpen);
      if (!urlToOpen.startsWith('http')) {
        urlToOpen = 'https://' + urlToOpen;
      }
    }
    
    console.log('Opening URL:', urlToOpen);
    
    // Send URL to client after a short delay
    setTimeout(() => {
      client.postMessage({ url: urlToOpen });
    }, 100);
    
    // Monitor when window closes
    const interval = setInterval(async () => {
      const clientsList = await clients.matchAll({ type: 'window' });
      const paymentWindow = clientsList.find(c => c.url.includes('navigate.html'));
      if (!paymentWindow && paymentResolver) {
        clearInterval(interval);
        paymentResolver({});
      }
    }, 500);
    
    // Auto-resolve after 5 minutes (timeout)
    setTimeout(() => {
      if (paymentResolver) {
        clearInterval(interval);
        paymentResolver({});
      }
    }, 300000);
    
  } catch (err) {
    console.error('Payment handler error:', err);
    if (paymentRejecter) paymentRejecter(err.message);
  }
});
