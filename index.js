'use strict';
let parse = require('./src/parser').parse;

module.exports = function(source) {
  this.cacheable();
  return parse(source);
}
