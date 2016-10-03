'use strict';
let expect = require('chai').expect;
let loader = require('../index');
let parser = require('../src/parser');

describe('loader', () => {
  let cacheableCalled = false;
  let loaderContext = {
    cacheable: () => { cacheableCalled = true },
    options: {
      requirejsPlugins: {
        plugins: ['plugin']
      }
    }
  };

  it('parses files with plugins', () => {
    let file = `
      define(['plugin!foo', 'css!foo'], function (plugin) => {
        // bananas
      })
      `;

    expect(loader.call(loaderContext, file)).to.equal(parser.parse(file, ['plugin']));
  });

  it('is cacheable', () => {
    expect(cacheableCalled).to.equal(true);
  });
});
