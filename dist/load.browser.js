(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _load = require('./load.service');

angular.module('sf.load', []).service('sfLoadService', _load.LoadService);

},{"./load.service":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// The following consts are object masks defining
// various states that will bet set on the given scope
var DEFAULT_VALUES = {
  activating: false, // Whether the content is loading for the first time
  activated: false, // Whether the content were set once
  loading: true, // The content is currently loading
  reloading: false, // The content is currently loading and were loaded once before
  loaded: false, // The content were loaded succesfully
  failed: null };

// Couldn't load the content
var LOAD_VALUES = {
  // activating: dynamically computed
  // activated: not modified
  loading: true,
  // reloading: dynamically computed
  loaded: false
};

// failed: dynamically computed
var SUCCESS_VALUES = {
  activating: false,
  activated: true,
  loading: false,
  reloading: false,
  loaded: true,
  failed: null
};

var FAIL_VALUES = {
  activating: false,
  // activated: not modified
  loading: false,
  reloading: false,
  loaded: false
};

// failed: dynamically get the error on fail
LoadService.$inject = ['$q', '$log'];

function LoadService($q, $log) {
  return {
    runState: runCustomState.bind(null, 'actions'),
    runCustomState: runCustomState,
    loadState: loadCustomState.bind(null, 'states'),
    loadCustomState: loadCustomState,
    wrapHTTPCall: wrapHTTPCall
  };

  //
  function runCustomState(prop, scope, name, promise) {
    return _manageLoadWorkflow(promise, scope, prop, name);
  }

  function loadCustomState(prop, scope, promises) {
    var newPromises = {};

    // Manage scope indicators for all the resources
    _manageLoadWorkflow($q.all(promises), scope, prop, '_all')
    // Here we catch _all errors to avoid unhandled reject warnings
    .catch(function (err) {
      $log.error(err);
    });

    // Manage individual resources scope indicators
    Object.keys(promises).forEach(function (key) {
      newPromises[key] = _manageLoadWorkflow(promises[key], scope, prop, key);
    });

    return newPromises;
  }

  function _manageLoadWorkflow(promise, scope, prop, key) {
    // Set initial load state
    _softlySetKey(scope, prop, key, LOAD_VALUES, {
      activating: !(scope[prop] && scope[prop][key] && scope[prop][key].activated),
      reloading: !!(scope[prop] && scope[prop][key] && scope[prop][key].activated)
    });
    // Handle success
    return promise.then(function (data) {
      $log.debug('Successful load:', scope, prop, key);
      _softlySetKey(scope, prop, key, SUCCESS_VALUES);
      return data;
      // Catch error and cast it
    }).catch(function (err) {
      $log.debug('Failed load:', scope, prop, key, err);
      _softlySetKey(scope, prop, key, FAIL_VALUES, {
        failed: err
      });
      throw err;
    });
  }

  function _softlySetKey(scope, prop, key) {
    // Ensure the prop is alright
    scope[prop] = scope[prop] || {};
    // Properly init the key if no set
    scope[prop][key] = scope[prop][key] || Object.keys(DEFAULT_VALUES).reduce(function (newObject, key) {
      newObject[key] = DEFAULT_VALUES[key];
      return newObject;
    }, {});
    // Carefully apply values

    for (var _len = arguments.length, values = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      values[_key - 3] = arguments[_key];
    }

    values.forEach(function (value) {
      Object.keys(value).forEach(function (valueKey) {
        scope[prop][key][valueKey] = value[valueKey];
      });
    });
  }

  function wrapHTTPCall(promise, expectedStatus) {
    return promise.catch(function (response) {
      var err = void 0;

      if (response.status !== expectedStatus) {
        if (0 >= response.status) {
          err = new Error('E_NETWORK');
          err.code = 'E_NETWORK';
          throw err;
        }
      }
      return response;
    }).then(function (response) {
      var err = void 0;

      if (response.status !== expectedStatus) {
        err = new Error(response.data.code || 'E_UNEXPECTED');
        err.code = response.data.code || 'E_UNEXPECTED';
        throw err;
      }

      return response;
    });
  }
}

exports.LoadService = LoadService;

},{}]},{},[1]);
