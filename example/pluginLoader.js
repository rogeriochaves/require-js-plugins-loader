module.exports = function (source) {
  // this.cacheable();

  return parse(source);
};

const parse = (source) =>
  source.replace(/'(.*?)!(.*?)'/g, "'$1' // requirejs_plugin|$2|");
