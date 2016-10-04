'use strict';
let parse = require('./src/parser').parse;
let loaderUtils = require('loader-utils');

module.exports = function(source, map) {
  this.cacheable();

  const config = loaderUtils.getLoaderConfig(this, 'requirejsPlugins');
  return this.callback(null, parse(source, config.plugins), map);
}
