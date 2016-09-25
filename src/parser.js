'use strict';
const defineRegex = `define\\(.*?\\[([\\s\\S]*?)\\].*?`;
const anyFunctionRegex = `\\(([\\s\\S]*?)\\)`;
const amdRegex = new RegExp(`${defineRegex}${anyFunctionRegex}`);
const pluginRegex = /['"`](.+?)!(.+?)['"`](.*?,?)/g;

const requestedDependencies = (file) =>
  file.match(amdRegex)[1].trim();

const annotatesPluginsInRequestedDependencies = (requestedDependencies) =>
  requestedDependencies.replace(pluginRegex, "'$1'$3 // requirejs_plugin|$2|");

const hasPlugins = (file) =>
  !!requestedDependencies(file).match(pluginRegex);

const parse = (file) => {
  if (!file.match(amdRegex) || !hasPlugins(file)) return file;

  let reqDependencies = requestedDependencies(file);

  let fileWithAnnotatedPlugins = file
    .replace(reqDependencies, annotatesPluginsInRequestedDependencies(reqDependencies));

  return fileWithAnnotatedPlugins;
};

module.exports = {
  parse,
  requestedDependencies,
  annotatesPluginsInRequestedDependencies,
  hasPlugins
}
