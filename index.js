let {parse} = require('./src/parser');

module.exports = function (source) {
  this.cacheable();
  return parse(source);
}
