define([], function () {
  return {
    load: function (param, require, onLoad, config) {
      setTimeout(function () {
        onLoad({
          result: param + ' yay processed'
        })
      }, 3000);
    }
  };
});
