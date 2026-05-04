// Listen for messages from the service worker
navigator.serviceWorker.addEventListener("message", (event) => {
  console.log("Received message from service worker:", event.data);
  
  if (event.data && event.data.url) {
    console.log("Redirecting to:", event.data.url);
    // Redirect to the requested URL
    location.replace(event.data.url);
  }
});

// Also notify that the page is ready
if (navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({ ready: true });
}
