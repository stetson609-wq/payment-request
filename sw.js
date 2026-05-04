// CardPay Payment Request Service Worker - FIXED VERSION

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle canmakepayment - must respond synchronously or with promise
self.addEventListener('canmakepayment', (event) => {
  console.log('canmakepayment event received');
  event.respondWith(Promise.resolve(true));
});

// Handle paymentrequest
self.addEventListener('paymentrequest', async (event) => {
  console.log('paymentrequest event received');
  
  // Create a promise that will resolve when payment is done
  let paymentResponsePromise = new Promise((resolve, reject) => {
    // Store resolve/reject for later use
    self.paymentResolver = resolve;
    self.paymentRejecter = reject;
  });
  
  event.respondWith(paymentResponsePromise);
  
  try {
    // Open the payment window
    const client = await event.openWindow('./pay/navigate.html');
    
    if (!client) {
      console.error('Failed to open window');
      if (self.paymentRejecter) self.paymentRejecter('Failed to open payment window');
      return;
    }
    
    // Get the URL from payment data
    const methodData = event.methodData[0];
    const data = methodData?.data || {};
    let urlToOpen = data.url || 'https://cardpay.com';
    
    // Validate URL
    if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
      console.error('Invalid URL:', urlToOpen);
      if (self.paymentRejecter) self.paymentRejecter('Invalid URL');
      return;
    }
    
    console.log('Opening URL:', urlToOpen);
    
    // Send URL to the client
    setTimeout(() => {
      client.postMessage({ url: urlToOpen });
    }, 500);
    
    // Set up message listener for client ready signal
    const messageHandler = (event) => {
      if (event.data && event.data.ready) {
        console.log('Client ready, sending URL again');
        event.source.postMessage({ url: urlToOpen });
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', messageHandler);
    
    // Resolve the payment after the window is closed
    const checkClosed = setInterval(async () => {
      const clients_list = await clients.matchAll();
      const paymentWindow = clients_list.find(c => c.url.includes('navigate.html'));
      if (!paymentWindow) {
        clearInterval(checkClosed);
        if (self.paymentResolver) self.paymentResolver({});
      }
    }, 500);
    
  } catch (err) {
    console.error('Payment handler error:', err);
    if (self.paymentRejecter) self.paymentRejecter(err.message);
  }
});
