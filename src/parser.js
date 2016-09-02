const defineRegex = `define\\(.*?\\[([\\s\\S]*?)\\].*?`;
const anyFunctionRegex = `\\(([\\s\\S]*?)\\)`;
const amdRegex = new RegExp(`${defineRegex}${anyFunctionRegex}`);
const lastCommaRegex = /,([\n\t\s]*)$/g;
const pluginRegex = /[\d\w-_]+![\d\w-_\*]+/g;

const requestedDependencies = (file) =>
  file.match(amdRegex)[1].trim();

const parsePlugin = (plugin, index) => {
  if (!plugin.match(pluginRegex)) return null;

  const splittedPlugin = plugin.replace(/['"`]/g, '').split('!');
  return { name: splittedPlugin[0], args: splittedPlugin[1], index };
}

const findPlugins = (requestedDependencies) =>
  requestedDependencies.match(/['"`](.*?)['"`]/g).map(parsePlugin).filter(p => p);

const removePluginsFromRequestedDependencies = (requestedDependencies) =>
  requestedDependencies
    .replace(pluginRegex, '')
    .replace(/[\s\t]+(''|""|``),?/g, '')
    .replace(lastCommaRegex, '$1');

const injectedDependencies = (file) =>
  file.match(amdRegex)[2];

const isNotPlugin = (plugins) => (_, index) =>
  !plugins.some(plugin => plugin.index === index);

const removePluginsFromInjectedDependencies = (injectedDependencies, plugins) =>
  injectedDependencies
    .match(/[\t\s\d\w_\$]+,?/g)
    .filter(isNotPlugin(plugins))
    .join('')
    .replace(lastCommaRegex, '$1');

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
  if (!file.match(amdRegex) || !hasPlugins(file)) return file;

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
