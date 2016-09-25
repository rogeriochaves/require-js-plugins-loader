var ReplaceSource = require("webpack-sources").ReplaceSource;
var RawSource = require("webpack-sources").RawSource;
var pluginLoader = require('./pluginLoader');

function RequireJsPluginsPlugin() {}

RequireJsPluginsPlugin.prototype.apply = function(compiler) {
  // compiler.plugin("compile", function(params) {
  //   params.loaders.unshift(path.join(__dirname, "pluginLoader.js"));;
  //   console.log(params.loaders);
  // });

  compiler.plugin("compilation", function(compilation) {
    compilation.mainTemplate.plugin('startup', function(source, module, hash) {
      console.log(source);
      return source;
    });
    compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
      chunks.forEach(function(chunk) {
        chunk.files.forEach(function(file) {
          var original = compilation.assets[file].source();
          var parsed = parse(original);
          compilation.assets[file] = new ReplaceSource(new RawSource(parsed), compilation.assets[file]);
        });
      });
      callback();
    });
  });
};

const parse = (file) => {
  const pluginsFound = file.match(new RegExp(pluginsRegex, 'g'));
  const plugins = pluginsFound ? parsePlugins(pluginsFound) : [];
  const patchedRequires = patchRequires(file);
  const patchedInitialLoad = patchInitialLoad(patchedRequires, plugins);
  return patchedInitialLoad;
};

const pluginsRegex = '__webpack_require__\\((.*?)\\) \\/\\/ requirejs_plugin\\|(.*?)\\|';

const patchRequires = (file) =>
      file.replace(new RegExp(pluginsRegex, 'g'), `__webpack_require__.requirejs_plugin['$1!$2']`);

const parsePlugins = (plugins) =>
      plugins.reduce((plugins, file) => {
        let parts = file.match(new RegExp(pluginsRegex));
        return [...plugins, {
          webpackRequire: parts[1],
          args: parts[2]
        }]
      }
   , []);

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

module.exports = RequireJsPluginsPlugin;
