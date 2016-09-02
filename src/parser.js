const requestedDependencies = (file) =>
  file.match(/define\(\[([\s\S]*?)\].*?function/)[1].trim();

const pluginRegex = /[\d\w-_]+![\d\w-_\*]+/g;

const parsePlugin = (plugin, index) => {
  if (!plugin.match(pluginRegex)) return null;

  const splittedPlugin = plugin.replace(/['"`]/g, '').split('!');
  return { name: splittedPlugin[0], args: splittedPlugin[1], index };
}

const findPlugins = (requestedDependencies) =>
  requestedDependencies.match(/['"`](.*?)['"`]/g).map(parsePlugin).filter(p => p);

const lastComma = /,([\n\t\s]*)$/g;

const removePluginsFromRequestedDependencies = (requestedDependencies) =>
  requestedDependencies
    .replace(pluginRegex, '')
    .replace(/[\s\t]+(''|""|``),?/g, '')
    .replace(lastComma, '$1');

const injectedDependencies = (file) =>
  file.match(/define[\s\S]*?function.*?\(([\s\S]*?)\)/)[1];

const isNotPlugin = (plugins) => (_, index) =>
  !plugins.some(plugin => plugin.index === index);

const removePluginsFromInjectedDependencies = (injectedDependencies, plugins) =>
  injectedDependencies
    .match(/[\t\s\d\w_\$]+,?/g)
    .filter(isNotPlugin(plugins))
    .join('')
    .replace(lastComma, '$1');

const lazyLoadPlugins = (file, plugins) =>
  plugins.reduce((file, {name, args}) =>
    `var ${name}Plugin = require('${name}').load;

    ${name}Plugin('${args}', require, function (${name}) {
      ${file}
    }, {});`
  , file);

const hasPlugins = (file) =>
  !!requestedDependencies(file).match(pluginRegex);

const parse = (file) => {
  let reqDependencies = requestedDependencies(file);
  let injDependencies = injectedDependencies(file);
  let plugins = findPlugins(reqDependencies);

  let fileWithoutPlugins = file
    .replace(reqDependencies, removePluginsFromRequestedDependencies(reqDependencies))
    .replace(injDependencies, removePluginsFromInjectedDependencies(injDependencies, plugins));

  return lazyLoadPlugins(fileWithoutPlugins, plugins);
};

module.exports = {
  parse,
  requestedDependencies,
  findPlugins,
  removePluginsFromRequestedDependencies,
  injectedDependencies,
  removePluginsFromInjectedDependencies,
  lazyLoadPlugins,
  hasPlugins
}
