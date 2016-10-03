define([
  'css!./style.css',
  './pluginDependency!someArg'
], function (css, loadedPlugin) {
  return {
    pluginResult: loadedPlugin.result
  };
});
