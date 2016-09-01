let expect = require('chai').expect;
let parser = require('../src/parser');
let beautify = (data) =>
  require('js-beautify').js_beautify(data, {max_preserve_newlines: 1})

describe('parser', () => {
  const requestedDependencies = `
    'lodash',
    "backbone",
    'backbone-validation',
    \`i18n!*\`,
    'foo!*'
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

  it('should work', () => {
    expect(beautify(parser.parse(fileFixture))).to.equal(beautify(`
      var fooLazy = require('bundle!foo');

      fooLazy(function (foo) {
        var i18nLazy = require('bundle!i18n');

        i18nLazy(function (i18n) {

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
          });
        });
    `));
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
      args: '*',
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
      var fooLazy = require('bundle!foo');

      fooLazy(function (foo) {
        var i18nLazy = require('bundle!i18n');

        i18nLazy(function (i18n) {
          ${fileFixture}
        });
      });
    `));
  });
});
