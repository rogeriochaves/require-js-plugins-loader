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
    };
  `);

  it('parses the file, loading the requirejs plugins', () => {
    expect(beautify(parser.parse(fileFixture))).to.equal(beautify(`
      var fooPlugin = require('foo').load;

      fooPlugin('bar', require, function (foo) {
        var i18nPlugin = require('i18n').load;

        i18nPlugin('*', require, function (i18n) {

          define([
            'lodash',
            "backbone",
            'backbone-validation'
          ], function(
            _,
            Backbone,
            BackboneValidation) {
              'use strict';
              console.log('i18n', i18n);
          };
        }, {});
      }, {});
    `));
  });

  describe('different AMD patterns', () => {
    it('parses anonymous modules', () => {
      expect(parser.parse(moduleSyntaxFixtures.anonymousModule)).to.match(/examplePlugin\('args'/);
    });

    it('parses named modules', () => {
      expect(parser.parse(moduleSyntaxFixtures.namedModule)).to.match(/examplePlugin\('args'/);
    });

    it('parses anonymous modules with arrow functions', () => {
      expect(parser.parse(moduleSyntaxFixtures.anonymousArrow)).to.match(/examplePlugin\('args'/);
    });

    it('parses named modules with arrow functions', () => {
      expect(parser.parse(moduleSyntaxFixtures.namedArrow)).to.match(/examplePlugin\('args'/);
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

  it('finds plugins', () => {
    expect(parser.findPlugins(requestedDependencies)).to.deep.equal([{
      name: 'i18n',
      args: '*',
      index: 3
    },
    {
      name: 'foo',
      args: 'bar',
      index: 4
    }]);
  });

  it('removes the plugins from requested dependencies', () => {
    expect(beautify(parser.removePluginsFromRequestedDependencies(requestedDependencies))).to.equal(beautify(`
      'lodash',
      "backbone",
      'backbone-validation'
    `));
  });

  it('finds the injected dependencies', () => {
    expect(beautify(parser.injectedDependencies(fileFixture))).to.equal(
      beautify(injectedDependencies)
    );
  });

  it('removes the plugins from injected dependencies', () => {
    const plugins = parser.findPlugins(requestedDependencies);

    expect(beautify(parser.removePluginsFromInjectedDependencies(injectedDependencies, plugins))).to.equal(beautify(`
      _,
      Backbone,
      BackboneValidation
    `));
  });

  it('adds lazy loaded plugins', () => {
    const plugins = parser.findPlugins(requestedDependencies);

    expect(beautify(parser.lazyLoadPlugins(fileFixture, plugins))).to.equal(beautify(`
      var fooPlugin = require('foo').load;

      fooPlugin('bar', require, function (foo) {
        var i18nPlugin = require('i18n').load;

        i18nPlugin('*', require, function (i18n) {
          ${fileFixture}
        }, {});
      }, {});
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
