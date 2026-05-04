// metro-config uses Array.prototype.toReversed (Node 20+). Polyfill for Node 18.
if (typeof Array.prototype.toReversed !== 'function') {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value: function toReversed() {
      return this.slice().reverse();
    },
    configurable: true,
    writable: true,
  });
}

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
