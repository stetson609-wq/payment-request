// CardPay Payment Request Service Worker
// Handles payment requests and opens the specified URL in a payment sheet

const CACHE_NAME = 'cardpay-sw-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Explicitly handle canmakepayment to avoid warnings
self.addEventListener('canmakepayment', (event) => {
  console.log('canmakepayment event received');
  event.respondWith(Promise.resolve(true));
});

self.addEventListener('paymentrequest', async (event) => {
  console.log('paymentrequest event received', event);
  
  let rejectFn;
  const responsePromise = new Promise((resolve, reject) => {
    rejectFn = reject;
  });
  
  event.respondWith(responsePromise);
  
  try {
    // Open a new window with navigate.html
    const client = await event.openWindow('./pay/navigate.html');
    
    if (!client) {
      console.error('Failed to open window');
      rejectFn('Failed to open payment window');
      return;
    }
    
    // Get the URL from the payment request data
    const methodData = event.methodData[0];
    const data = methodData?.data || {};
    let urlToOpen = data.url || 'https://cardpay.com';
    
    // Validate URL
    if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
      console.error('Invalid URL:', urlToOpen);
      rejectFn('Not a valid URL to open');
      return;
    }
    
    console.log('Sending URL to client:', urlToOpen);
    
    // Wait for client to be ready and send the URL
    await new Promise(r => setTimeout(r, 500));
    client.postMessage({ url: urlToOpen });
    
    // Resolve the payment request after a delay (when the window closes)
    setTimeout(() => {
      resolve({});
    }, 1000);
    
  } catch (err) {
    console.error('Payment request error:', err);
    rejectFn(err.message);
  }
});
