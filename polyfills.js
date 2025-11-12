/**
 * DOM Polyfills for Three.js in React Native
 * Must be imported before any other code
 */

// Polyfill document object
if (typeof global.document === 'undefined') {
  const mockElement = {
    contains: () => false,
    appendChild: () => {},
    removeChild: () => {},
    insertBefore: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByTagName: () => [],
    getElementsByClassName: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    setAttribute: () => {},
    getAttribute: () => null,
    removeAttribute: () => {},
    hasAttribute: () => false,
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {},
    },
  };

  global.document = {
    createElement: (tag) => ({ ...mockElement, tagName: tag }),
    createElementNS: (ns, tag) => ({ ...mockElement, tagName: tag }),
    createTextNode: (text) => ({ nodeValue: text }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementsByTagName: () => [],
    getElementsByClassName: () => [],
    head: mockElement,
    body: mockElement,
    documentElement: mockElement,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    location: {
      href: '',
      protocol: 'https:',
      host: '',
      hostname: '',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
    },
  };
}

// Ensure window.document exists
if (typeof window !== 'undefined') {
  if (!window.document) {
    window.document = global.document;
  }
}

console.log('[Polyfills] document polyfill loaded');
