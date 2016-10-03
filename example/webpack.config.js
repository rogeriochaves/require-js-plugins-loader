var RequirejsPluginsLoaderPlugin = require('../Plugin');
var webpack = require('webpack');

module.exports = {
  entry: "./firstDependency.js",
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: '../index.js' }
    ]
  },
  requirejsPlugins: {
    plugins: ['pluginDependency']
  },
  plugins: [
    new RequirejsPluginsLoaderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ]
};
