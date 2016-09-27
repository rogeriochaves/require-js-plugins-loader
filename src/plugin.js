'use strict';
let ReplaceSource = require('webpack-sources').ReplaceSource;
let RawSource = require('webpack-sources').RawSource;

class RequirejsPluginsLoaderPlugin {
  apply (compiler) {
    addPluginToCompiler(compiler);
  }
};

const addPluginToCompiler = (compiler) => {
  compiler.plugin('compilation', (compilation) => {
    compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
      replaceChunks(compilation, chunks);
      callback();
    });
  });
};

const replaceChunks = (compilation, chunks) => chunks.forEach((chunk) => {
  chunk.files.forEach((file) => {
    const original = compilation.assets[file].source();
    const parsed = parse(original);
    const replacedSource = new ReplaceSource(new RawSource(parsed), compilation.assets[file]);
    compilation.assets[file] = replacedSource;
  });
});

const parse = (file) => {
  const pluginRequires = findPluginRequires(file);
  const plugins = pluginRequires ? parsePluginRequires(pluginRequires) : [];
  const patchedRequires = patchRequires(file);
  const patchedInitialLoad = patchInitialLoad(patchedRequires, plugins);
  return patchedInitialLoad;
};

const findPluginRequires = (file) => file.match(new RegExp(pluginsRegex, 'g'));

const pluginsRegex = '__webpack_require__\\((.*?)\\) \\/\\/ requirejs_plugin\\|(.*?)\\|';

const patchRequires = (file) =>
      file.replace(new RegExp(pluginsRegex, 'g'), `__webpack_require__.requirejs_plugin['$1!$2']`);

const parsePluginRequires = (plugins) =>
      plugins.reduce(parsePluginRequire, []);

const parsePluginRequire = (plugins, file) => {
  const parts = file.match(new RegExp(pluginsRegex));
  return plugins.concat([{
    webpackRequire: parts[1],
    args: parts[2]
  }]);
};

const initialRequire = '__webpack_require__(0);';

const patchInitialLoad = (file, plugins) =>
      addPluginsLoad(file.replace(`return ${initialRequire}`,
         `__webpack_require__.requirejs_plugin = {};
          return ${initialRequire}`), plugins);

const addPluginsLoad = (file, plugins) =>
      plugins.reduce(addPluginLoad, file);

const addPluginLoad = (file, plugin) =>
      file.replace(initialRequire,
         `__webpack_require__(${plugin.webpackRequire}).load('${plugin.args}', {}, function (result) {
            __webpack_require__.requirejs_plugin['${plugin.webpackRequire}!${plugin.args}'] = result;
            ${initialRequire}
          }, {});`);

module.exports = {
  RequirejsPluginsLoaderPlugin,
  patchRequires,
  findPluginRequires,
  parsePluginRequires,
  patchInitialLoad,
  parse
};
