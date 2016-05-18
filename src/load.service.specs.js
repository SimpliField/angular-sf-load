import assert from 'assert';
import sinon from 'sinon';
import Promise from 'bluebird';
import { LoadService } from './load.service';

describe('LoadService', () => {

  let $scope;
  let $log;
  let $q = {
    all: function(obj) {
      return Promise.all(Object.keys(obj).map((key) => obj[key]))
      .then((results) => Object.keys(obj).reduce((newObj, key, i) => {
        newObj[key] = results[i];
        return newObj;
      }, {}));
    },
  };
  let loadService;

  beforeEach(() => {
    $scope = {};
    $log = {
      debug: sinon.stub(),
      error: sinon.stub(),
    };
    loadService = new LoadService($q, $log);
  });

  describe('runCustomState()', () => {

    it('should work with successful load once', (done) => {
      let loadingState = _promiseStub();

      loadService.runCustomState('actions', $scope, 'actionName', loadingState.promise)
      .then((result) => {
        assert.equal(result, 'value', 'Value to be correctly transmitted.');
        assert.deepEqual($scope.actions, {
          actionName: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
        }, 'Loaded state correctly set.');
        done();
      })
      .catch(done);

      assert.deepEqual($scope.actions, {
        actionName: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
      }, 'Loading state correctly set.');

      loadingState.resolve('value');
    });

    it('should work with successful load twice', (done) => {
      loadService.runCustomState('actions', $scope, 'actionName', Promise.resolve('plop'))
      .then(() => {
        let loadingState = _promiseStub();

        let loadPromise = loadService.runCustomState(
          'actions', $scope, 'actionName', loadingState.promise
        )
        .then((result) => {
          assert.equal(result, 'value', 'Value to be correctly transmitted.');
          assert.deepEqual($scope.actions, {
            actionName: {
              activating: false,
              activated: true,
              loading: false,
              reloading: false,
              loaded: true,
              failed: null,
            },
          }, 'Loaded state correctly set.');
        });

        assert.deepEqual($scope.actions, {
          actionName: {
            activating: false,
            activated: true,
            loading: true,
            reloading: true,
            loaded: false,
            failed: null,
          },
        }, 'Loading state correctly set.');

        loadingState.resolve('value');

        return loadPromise;
      })
      .then(done)
      .catch(done);
    });

    it('should work with errored load', (done) => {
      let loadingState = _promiseStub();

      loadService.runCustomState('actions', $scope, 'actionName', loadingState.promise)
      .catch((err) => {
        assert.equal(err.message, 'E_ERROR', 'Error to be correctly transmitted.');
        assert.deepEqual($scope.actions, {
          actionName: {
            activating: false,
            activated: false,
            loading: false,
            reloading: false,
            loaded: false,
            failed: new Error('E_ERROR'),
          },
        }, 'Errored state correctly set.');
      })
      .then(done)
      .catch(done);

      assert.deepEqual($scope.actions, {
        actionName: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
      }, 'Loading state correctly set.');

      loadingState.reject(new Error('E_ERROR'));
    });

  });

  describe('runState()', () => {

    it('should work with successful load once', (done) => {
      let loadingState = _promiseStub();

      loadService.runState($scope, 'actionName', loadingState.promise)
      .then((result) => {
        assert.equal(result, 'value', 'Value to be correctly transmitted.');
        assert.deepEqual($scope.actions, {
          actionName: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
        }, 'Loaded state correctly set.');
        done();
      })
      .catch(done);

      assert.deepEqual($scope.actions, {
        actionName: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
      }, 'Loading state correctly set.');

      loadingState.resolve('value');
    });

  });

  describe('loadCustomState()', () => {

    it('should work with successful load once', (done) => {
      let loadingState1 = _promiseStub();
      let loadingState2 = _promiseStub();

      $q.all(loadService.loadCustomState('main', $scope, {
        state1: loadingState1.promise,
        state2: loadingState2.promise,
      }))
      .then((result) => {
        assert.deepEqual(result, {
          state1: 'value1',
          state2: 'value2',
        }, 'Values to be correctly transmitted.');
        assert.deepEqual($scope.main, {
          _all: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
          state1: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
          state2: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
        }, 'Loaded state correctly set.');
        done();
      })
      .catch(done);

      assert.deepEqual($scope.main, {
        _all: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
        state1: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
        state2: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
      }, 'Loading state correctly set.');

      loadingState1.resolve('value1');
      loadingState2.resolve('value2');
    });

    it('should work with successful load twice', (done) => {
      let loadingState1 = _promiseStub();
      let loadingState2 = _promiseStub();

      $scope.main = {
        _all: {
          activating: false,
          activated: true,
          loading: false,
          reloading: false,
          loaded: true,
          failed: null,
        },
        state1: {
          activating: false,
          activated: true,
          loading: false,
          reloading: false,
          loaded: true,
          failed: null,
        },
        state2: {
          activating: false,
          activated: true,
          loading: false,
          reloading: false,
          loaded: true,
          failed: null,
        },
      };

      $q.all(loadService.loadCustomState('main', $scope, {
        state1: loadingState1.promise,
        state2: loadingState2.promise,
      }))
      .then((result) => {
        assert.deepEqual(result, {
          state1: 'value1',
          state2: 'value2',
        }, 'Values to be correctly transmitted.');
        assert.deepEqual($scope.main, {
          _all: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
          state1: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
          state2: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
        }, 'Loaded state correctly set.');
        done();
      })
      .catch(done);

      assert.deepEqual($scope.main, {
        _all: {
          activating: false,
          activated: true,
          loading: true,
          reloading: true,
          loaded: false,
          failed: null,
        },
        state1: {
          activating: false,
          activated: true,
          loading: true,
          reloading: true,
          loaded: false,
          failed: null,
        },
        state2: {
          activating: false,
          activated: true,
          loading: true,
          reloading: true,
          loaded: false,
          failed: null,
        },
      }, 'Loading state correctly set.');

      loadingState1.resolve('value1');
      loadingState2.resolve('value2');
    });

    it('should work with nested load results', (done) => {
      let loadingState1 = _promiseStub();
      let loadingState2 = _promiseStub();

      $q.all(loadService.loadCustomState('main', $scope, {
        state1: loadingState1.promise,
        state2: loadingState2.promise,
      }))
      .catch((err) => {
        assert.deepEqual(err, new Error('E_ERROR'),
          'Error to be correctly transmitted.');
        assert.deepEqual($scope.main, {
          _all: {
            activating: false,
            activated: false,
            loading: false,
            reloading: false,
            loaded: false,
            failed: new Error('E_ERROR'),
          },
          state1: {
            activating: false,
            activated: true,
            loading: false,
            reloading: false,
            loaded: true,
            failed: null,
          },
          state2: {
            activating: false,
            activated: false,
            loading: false,
            reloading: false,
            loaded: false,
            failed: new Error('E_ERROR'),
          },
        }, 'Nested states correctly set.');
      })
      .then(done)
      .catch(done);

      assert.deepEqual($scope.main, {
        _all: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
        state1: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
        state2: {
          activating: true,
          activated: false,
          loading: true,
          reloading: false,
          loaded: false,
          failed: null,
        },
      }, 'Loading state correctly set.');

      loadingState1.resolve('value1');
      loadingState2.reject(new Error('E_ERROR'));
    });

    describe('loadState()', () => {

      it('should work with successful load once', (done) => {
        let loadingState1 = _promiseStub();
        let loadingState2 = _promiseStub();

        $q.all(loadService.loadState($scope, {
          state1: loadingState1.promise,
          state2: loadingState2.promise,
        }))
        .then((result) => {
          assert.deepEqual(result, {
            state1: 'value1',
            state2: 'value2',
          }, 'Values to be correctly transmitted.');
          assert.deepEqual($scope.states, {
            _all: {
              activating: false,
              activated: true,
              loading: false,
              reloading: false,
              loaded: true,
              failed: null,
            },
            state1: {
              activating: false,
              activated: true,
              loading: false,
              reloading: false,
              loaded: true,
              failed: null,
            },
            state2: {
              activating: false,
              activated: true,
              loading: false,
              reloading: false,
              loaded: true,
              failed: null,
            },
          }, 'Loaded state correctly set.');
          done();
        })
        .catch(done);

        assert.deepEqual($scope.states, {
          _all: {
            activating: true,
            activated: false,
            loading: true,
            reloading: false,
            loaded: false,
            failed: null,
          },
          state1: {
            activating: true,
            activated: false,
            loading: true,
            reloading: false,
            loaded: false,
            failed: null,
          },
          state2: {
            activating: true,
            activated: false,
            loading: true,
            reloading: false,
            loaded: false,
            failed: null,
          },
        }, 'Loading state correctly set.');

        loadingState1.resolve('value1');
        loadingState2.resolve('value2');
      });

    });
  });

  describe('wrapHTTPCall()', () => {

    it('should do nothing on http call success with expected status', (done) => {
      let httpCall = _promiseStub();

      loadService.wrapHTTPCall(httpCall.promise, 200)
      .then((response) => {
        assert.deepEqual(response, {
          status: 200,
          data: {
            tata: 'yoyo',
          },
        }, 'Response payload to remain the same.');
      })
      .then(done)
      .catch(done);
      httpCall.resolve({
        status: 200,
        data: {
          tata: 'yoyo',
        },
      });
    });

    it('should error on http call success with unexpected status', (done) => {
      let httpCall = _promiseStub();

      loadService.wrapHTTPCall(httpCall.promise, 201)
      .catch((err) => {
        assert.deepEqual(err.message, 'E_UNEXPECTED', 'Unexpected error.');
      })
      .then(done)
      .catch(done);
      httpCall.resolve({
        status: 200,
        data: {
          tata: 'yoyo',
        },
      });
    });

    it('should do nothing on http call error with expected status', (done) => {
      let httpCall = _promiseStub();

      loadService.wrapHTTPCall(httpCall.promise, 410)
      .then((response) => {
        assert.deepEqual(response, {
          status: 410,
          data: {
            code: 'E_GONE',
          },
        }, 'Response payload to remain the same.');
      })
      .then(done)
      .catch(done);
      httpCall.reject({
        status: 410,
        data: {
          code: 'E_GONE',
        },
      });
    });

    it('should error on http call error with unexpected status', (done) => {
      let httpCall = _promiseStub();

      loadService.wrapHTTPCall(httpCall.promise, 410)
      .catch((err) => {
        assert.deepEqual(err.message, 'E_FATAL_BLUE_SCREEN', 'Casted error.');
      })
      .then(done)
      .catch(done);
      httpCall.reject({
        status: 500,
        data: {
          code: 'E_FATAL_BLUE_SCREEN',
        },
      });
    });

    it('should error on http call network errors', (done) => {
      let httpCall = _promiseStub();

      loadService.wrapHTTPCall(httpCall.promise, 410)
      .catch((err) => {
        assert.deepEqual(err.message, 'E_NETWORK', 'Casted error.');
      })
      .then(done)
      .catch(done);
      httpCall.reject({
        status: 0,
      });
    });

  });

});

function _promiseStub() {
  let resolve;
  let reject;

  let promise = new Promise((_resolve_, _reject_) => {
    resolve = _resolve_;
    reject = _reject_;
  });

  return {
    reject,
    resolve,
    promise,
  };
}
