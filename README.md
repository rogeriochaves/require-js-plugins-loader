# require-js-plugins-loader
[![Build Status](https://snap-ci.com/rogeriochaves/require-js-plugins-loader/branch/master/build_image)](https://snap-ci.com/rogeriochaves/require-js-plugins-loader/branch/master)
[![npm](https://img.shields.io/npm/dt/require-js-plugins-loader.svg?maxAge=2592000)]()

This library attempts to simulate Require.js plugins within webpack,
it is still in very early stage, but you can try use it like this:

```javascript
var RequirejsPluginsLoaderPlugin = require('require-js-plugins-loader/Plugin');

module.exports = {
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'require-js-plugins' }
    ]
  },
  requirejsPlugins: {
    plugins: ['myPlugin'] // add requirejs plugins to be parsed here
  },
  plugins: [
    new RequirejsPluginsLoaderPlugin()
  ]
}
```
