'use strict';
const defineRegex = `define\\(.*?\\[([\\s\\S]*?)\\].*?`;
const anyFunctionRegex = `\\(([\\s\\S]*?)\\)`;
const amdRegex = new RegExp(`${defineRegex}${anyFunctionRegex}`);
const pluginRegex = /['"`](.+?)!(.+?)['"`](.*?,?)/g;

const requestedDependencies = (file) =>
  file.match(amdRegex)[1].trim();

const annotatesPluginsInRequestedDependencies = (requestedDependencies, config) =>
  requestedDependencies.replace(pluginRegex, parsePlugin(config));

const parsePlugin = (configPlugins) => (match, dependency, args, whitespace) => {
  if (configPlugins && configPlugins.indexOf(dependency) < 0) {
    return match;
  } else {
    return `'${dependency}'${whitespace} // requirejs_plugin|${args}|`;
  };
};

const hasPlugins = (file) =>
  !!requestedDependencies(file).match(pluginRegex);

const parse = (file, configPlugins) => {
  if (!file.match(amdRegex) || !hasPlugins(file)) return file;

  let reqDependencies = requestedDependencies(file);

  let fileWithAnnotatedPlugins = file
    .replace(reqDependencies, annotatesPluginsInRequestedDependencies(reqDependencies, configPlugins));

  return fileWithAnnotatedPlugins;
};

module.exports = {
  parse,
  requestedDependencies,
  annotatesPluginsInRequestedDependencies,
  hasPlugins
}
