# angular-sf-load
> Manage AngularJS scope load.

[![NPM version](https://badge.fury.io/js/angular-sf-load.svg)](https://npmjs.org/package/angular-sf-load)
[![Build status](https://secure.travis-ci.org/SimpliField/angular-sf-load.svg)](https://travis-ci.org/SimpliField/angular-sf-load)
[![Dependency Status](https://david-dm.org/SimpliField/angular-sf-load.svg)](https://david-dm.org/SimpliField/angular-sf-load)
[![devDependency Status](https://david-dm.org/SimpliField/angular-sf-load/dev-status.svg)](https://david-dm.org/SimpliField/angular-sf-load#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/SimpliField/angular-sf-load/badge.svg?branch=master)](https://coveralls.io/github/SimpliField/angular-sf-load?branch=master)
[![Code Climate](https://codeclimate.com/github/SimpliField/angular-sf-load.svg)](https://codeclimate.com/github/SimpliField/angular-sf-load)


When it comes to load resources in an AngularJS scope, things are very
 repetitive. Indeed, you have to manage with loading/failed/loaded etc... states
 all the time.

`angular-sf-load` allows to do it by simply adding a promise state in your
 controller/components state load/actions handling. Here is a simple example of
 how to use it in a simple component:
```html
<h1>Heroes</h1>

<!-- Handle all states first load wait -->
<p ng-if="$ctrl.states._all.activating">
  Loading...
</p>
<!-- Handle all states first load failure -->
<p ng-if="$ctrl.states._all.failed && !$ctrl.states._all.activated">
  Unrecoverable error: {{ $ctrl.states._all.failed.code }}
</p>

<!-- States were loaded once -->
<div ng-if="$ctrl.states._all.activated" ng-repeat="hero in $ctrl.list">
  <h2>{{ hero.name }}</h2>
  <!-- Cannot delete an hero twice + giving feedback ;) -->
  <button ng-click="$ctrl.deleteHero(hero)"
    ng-disabled="$ctrl.actions['delete:' + hero._id].loading">
    {{ $ctrl.actions['delete:' + hero._id].loading ? 'Delete' : 'Deleting' }}
  </button>
</div>
<!-- Handle hero list reload wait -->
<p ng-if="$ctrl.states.heros.reloading">
  Refreshing...
</p>

```

```js
// Example stolen from the AngularJS documentation
angular
  .module('myUserListComponent', ['sf.load'])
  .component('heroList', {
    template: `path/to/template.html`,
    controller: HeroListController
  });

function HeroListController(sfLoadService, herosService) {
  var ctrl = this;

  ctrl.deleteHero = deleteHero;

  activate();

  function activate() {
    sfLoadService.loadState($scope, {
      heros: herosService.list(),
      categories: herosService.getCategories(),
    }).then(({ heros, categories }) => {
      ctrl.heros = heros;
      ctrl.categories = categories;
    });
  }

  function deleteHero(hero) {
    sfLoadService.runState(
      $scope,
      'delete:' + hero._id,
      herosService.delete(hero._id)
    );
  }
}
```

You can also see real world usage [here](https://github.com/nfroidure/TripStory).
