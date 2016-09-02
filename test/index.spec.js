let expect = require('chai').expect;
let loader = require('../index');
let parser = require('../src/parser');

describe('loader', () => {
  it('parses files with plugins', () => {
    let file = `
      define(['plugin!foo'], function (plugin) => {
        // bananas
      })
      `;

    expect(loader(file)).to.equal(parser.parse(file));
  });
});
