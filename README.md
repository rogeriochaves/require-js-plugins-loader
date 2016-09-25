# require-js-plugins-loader
[![Build Status](https://snap-ci.com/rogeriochaves/require-js-plugins-loader/branch/master/build_image)](https://snap-ci.com/rogeriochaves/require-js-plugins-loader/branch/master)

This library attempts to simulate Require.js plugins within webpack,
it is still in very early stage, but you can try use it like this:

```javascript
var RequirejsPluginsLoaderPlugin = require('require-js-plugins-loader/Plugin');

module.exports = {
  entry: "./index.js",
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'require-js-plugins' }
    ]
  },
  plugins: [
    new RequirejsPluginsLoaderPlugin()
  ]
}
```
