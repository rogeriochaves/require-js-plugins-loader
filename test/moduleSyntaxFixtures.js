exports.anonymousModule = `
  define(['dep1', 'example!args', 'dep2'], function (dep1, dep2) {
      return function () {};
  });
`;

exports.namedModule = `
  define('myModule', ['dep1', 'example!args', 'dep2'], function (dep1, dep2) {
      return function () {};
  });
`;

exports.anonymousArrow = `
  define(['dep1', 'example!args', 'dep2'], (dep1, dep2) => {
      return function () {};
  });
`;

exports.namedArrow = `
  define('myModule', ['dep1', 'example!args', 'dep2'], (dep1) => {
      return function () {};
  });
`;

exports.nonAMD = `
  let dep1 = require('dep1');
  let dep2 = require('dep2');

  module.exports = () => {};
`;

exports.withoutPlugin = `
  define('myModule', ['dep1', 'dep2'], function (dep1, dep2) {
      return function () {};
  });
`;
