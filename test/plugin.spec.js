'use strict';
let expect = require('chai').expect;
let plugin = require('../src/plugin');
let jsBeautify = require('js-beautify').js_beautify;
let beautify = (data) =>
  jsBeautify(data, {max_preserve_newlines: 1})
let moduleSyntaxFixtures = require('./moduleSyntaxFixtures');

describe('plugin', () => {
  ;
  const bundledFileFixture = beautify(
    `/******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(0);
    /* 0 */
    /***/ function(module, exports, __webpack_require__) {
      var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
        __webpack_require__(1)
      ], __WEBPACK_AMD_DEFINE_RESULT__ = function (secondDependency) {
        console.log('result', secondDependency.pluginResult);
      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


      /***/ },
    /* 1 */
    /***/ function(module, exports, __webpack_require__) {

      var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
        __webpack_require__(2), // requirejs_plugin|someArg|
        __webpack_require__(3) // requirejs_plugin|barBaz|
      ], __WEBPACK_AMD_DEFINE_RESULT__ = function (loadedPlugin) {
        return {
          pluginResult: loadedPlugin.result
        };
      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
  `);

  it('patches the requires, replacing with requirejs_plugin require', () => {
    expect(plugin.patchRequires(bundledFileFixture)).not.to.contain(
      '__webpack_require__(2), // requirejs_plugin|someArg|'
    );
    expect(plugin.patchRequires(bundledFileFixture)).not.to.contain(
      '__webpack_require__(3) // requirejs_plugin|barBaz|'
    );
    expect(plugin.patchRequires(bundledFileFixture)).to.contain(
      "__webpack_require__.requirejs_plugin['2!someArg']"
    );
  });

  it('finds plugin requires', () => {
    expect(plugin.findPluginRequires(bundledFileFixture)).to.deep.equal([
      '__webpack_require__(2), // requirejs_plugin|someArg|',
      '__webpack_require__(3) // requirejs_plugin|barBaz|'
    ]);
  });

  it('parses the plugin requires', () => {
    const pluginRequires = [
      '__webpack_require__(2), // requirejs_plugin|someArg|',
      '__webpack_require__(3) // requirejs_plugin|*|'
    ];

    expect(plugin.parsePluginRequires(pluginRequires)).to.deep.equal([{
      webpackRequire: '2',
      args: 'someArg'
    }, {
      webpackRequire: '3',
      args: '*'
    }]);
  });

  it('ignores duplicated requires', () => {
    const pluginRequires = [
      '__webpack_require__(2), // requirejs_plugin|someArg|',
      '__webpack_require__(2), // requirejs_plugin|someArg|',
      '__webpack_require__(2) // requirejs_plugin|anotherArg|'
    ];

    expect(plugin.parsePluginRequires(pluginRequires)).to.deep.equal([{
      webpackRequire: '2',
      args: 'someArg'
    }, {
      webpackRequire: '2',
      args: 'anotherArg'
    }]);
  });

  it('patches the initial load with all the plugins', () => {
    const plugins = [{
      webpackRequire: '2',
      args: 'someArg'
    }, {
      webpackRequire: '3',
      args: '*'
    }];
    const initialLoad = 'return __webpack_require__(0);';

    expect(beautify(plugin.patchInitialLoad(initialLoad, plugins))).to.equal(beautify(
      `__webpack_require__.requirejs_plugin = {};
      return __webpack_require__(2).load('someArg', {}, function (result) {
        __webpack_require__.requirejs_plugin['2!someArg'] = result;
        __webpack_require__(3).load('*', {}, function (result) {
          __webpack_require__.requirejs_plugin['3!*'] = result;
          __webpack_require__(0);
        }, {});
      }, {});
      `));
  });

  it('parses a whole file', () => {
    const parsed = plugin.parse(bundledFileFixture);
    expect(beautify(parsed)).to.equal(beautify(
      `/******/ 	// Load entry module and return exports
      /******/ 	__webpack_require__.requirejs_plugin = {};
      return __webpack_require__(2).load('someArg', {}, function (result) {
        __webpack_require__.requirejs_plugin['2!someArg'] = result;
        __webpack_require__(3).load('barBaz', {}, function (result) {
          __webpack_require__.requirejs_plugin['3!barBaz'] = result;
          __webpack_require__(0);
        }, {});
      }, {});
      /* 0 */
      /***/ function(module, exports, __webpack_require__) {
        var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
          __webpack_require__(1)
        ], __WEBPACK_AMD_DEFINE_RESULT__ = function (secondDependency) {
          console.log('result', secondDependency.pluginResult);
        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


        /***/ },
      /* 1 */
      /***/ function(module, exports, __webpack_require__) {

        var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
          __webpack_require__.requirejs_plugin['2!someArg'],
          __webpack_require__.requirejs_plugin['3!barBaz']
        ], __WEBPACK_AMD_DEFINE_RESULT__ = function (loadedPlugin) {
          return {
            pluginResult: loadedPlugin.result
          };
        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
      }
      `));
  });
});
