'use strict';
let parse = require('./src/parser').parse;
let loaderUtils = require('loader-utils');

module.exports = function(source) {
  this.cacheable();

  const config = loaderUtils.getLoaderConfig(this, 'requirejsPlugins');
  return parse(source, config.plugins);
}
