'use strict';
let expect = require('chai').expect;
let parser = require('../src/parser');
let jsBeautify = require('js-beautify').js_beautify;
let beautify = (data) =>
  jsBeautify(data, {max_preserve_newlines: 1})
let moduleSyntaxFixtures = require('./moduleSyntaxFixtures');

describe('parser', () => {
  const requestedDependencies = `
    'lodash',
    "backbone",
    'backbone-validation',
    \`i18n!*\`,
    'do-not-parse-me!please',
    'foo!bar'
  `;
  const injectedDependencies = `
    _,
    Backbone,
    BackboneValidation,
    i18n
  `;
  const fileFixture = beautify(`
    define([
      ${requestedDependencies}
    ], function(
      ${injectedDependencies}
    ) {
      'use strict';
      console.log('i18n', i18n);
    });
  `);
  const configPlugins = ['i18n', 'foo'];

  it('parses the file, adding special comments for the configured requirejs plugins', () => {
    expect(beautify(parser.parse(fileFixture, configPlugins))).to.equal(beautify(`
      define([
        'lodash',
        "backbone",
        'backbone-validation',
        'i18n', // requirejs_plugin|*|
        'do-not-parse-me!please',
        'foo' // requirejs_plugin|bar|
      ], function(
        _,
        Backbone,
        BackboneValidation,
        i18n
      ) {
          'use strict';
          console.log('i18n', i18n);
      });
    `));
  });

  describe('different AMD patterns', () => {
    const parsedRequire = /example', \/\/ requirejs_plugin\|args\|/;

    it('parses anonymous modules', () => {
      expect(parser.parse(moduleSyntaxFixtures.anonymousModule)).to.match(parsedRequire);
    });

    it('parses named modules', () => {
      expect(parser.parse(moduleSyntaxFixtures.namedModule)).to.match(parsedRequire);
    });

    it('parses anonymous modules with arrow functions', () => {
      expect(parser.parse(moduleSyntaxFixtures.anonymousArrow)).to.match(parsedRequire);
    });

    it('parses named modules with arrow functions', () => {
      expect(parser.parse(moduleSyntaxFixtures.namedArrow)).to.match(parsedRequire);
    });

    it('ignores non-amd modules', () => {
      expect(parser.parse(moduleSyntaxFixtures.nonAMD)).to.equal(moduleSyntaxFixtures.nonAMD);
    });

    it('ignores modules without plugins', () => {
      expect(parser.parse(moduleSyntaxFixtures.withoutPlugin)).to.equal(moduleSyntaxFixtures.withoutPlugin);
    });
  });

  it('finds the requested dependencies', () => {
    expect(beautify(parser.requestedDependencies(fileFixture))).to.equal(beautify(requestedDependencies));
  });

  it('annotates specified plugins in the requested dependencies', () => {
    expect(beautify(parser.annotatesPluginsInRequestedDependencies(requestedDependencies, configPlugins))).to.equal(beautify(`
      'lodash',
      "backbone",
      'backbone-validation',
      'i18n', // requirejs_plugin|*|
      'do-not-parse-me!please',
      'foo' // requirejs_plugin|bar|
    `));
  });

  it('annotates all plugins in the requested dependencies if there is no config', () => {
    expect(beautify(parser.annotatesPluginsInRequestedDependencies(requestedDependencies))).to.equal(beautify(`
      'lodash',
      "backbone",
      'backbone-validation',
      'i18n', // requirejs_plugin|*|
      'do-not-parse-me', // requirejs_plugin|please|
      'foo' // requirejs_plugin|bar|
    `));
  });

  describe('searches for plugins', () => {
    it('returns true for files that have plugins', () => {
      expect(parser.hasPlugins(fileFixture)).to.equal(true);
    });

    it('returns false for files that do not have plugins', () => {
      expect(parser.hasPlugins(`
        define([foo], function(foo) {
          var foo = 'bar!baz';
        });
      `)).to.equal(false);
    });
  });
});
