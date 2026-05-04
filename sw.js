// CardPay Payment Request Service Worker
// Handles payment requests and opens the specified URL in a payment sheet

self.addEventListener("canmakepayment", (e) => {
  console.log("canmakepayment event received");
  e.respondWith(true);
});

self.addEventListener("paymentrequest", async (event) => {
  console.log("paymentrequest event received", event);

  let reject;
  let promise = new Promise((_, reject_) => {
    reject = reject_;
  });

  event.respondWith(promise);

  // Open the navigate.html window
  let client = await event.openWindow("./pay/navigate.html");
  
  if (!client) {
    console.error("Failed to open window");
    return reject("Failed to open payment window.");
  }

  // Get the URL from the payment request data
  let data = event.methodData[0]?.data;
  let urlToOpen = data?.url || "https://cardpay.com";

  // Validate URL
  if (!urlToOpen.startsWith("http://") && !urlToOpen.startsWith("https://")) {
    console.error("Invalid URL:", urlToOpen);
    return reject("Not a valid URL to open. Must start with http:// or https://");
  }

  console.log("Opening URL in payment sheet:", urlToOpen);

  // Send the URL to the navigate.html page
  client.postMessage({ url: urlToOpen });
});
