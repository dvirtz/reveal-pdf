// Mock current script to be able to spy on it
Object.defineProperty(document, 'currentScript', {
  configurable: true,
  get() {
    return document.createElement('script');
  },
});
