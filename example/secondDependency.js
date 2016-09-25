define([
  './pluginDependency!someArg'
], function (loadedPlugin) {
  return {
    pluginResult: loadedPlugin.result
  };
});
