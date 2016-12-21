# angular-sf-load
> Manage AngularJS scope load.

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/98b4d97d9e274eca997ba043780f5003)](https://www.codacy.com/app/SimpliField/angular-sf-load?utm_source=github.com&utm_medium=referral&utm_content=SimpliField/angular-sf-load&utm_campaign=badger)
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
 how to use it in a simple component (you can see this code in action
  [here](https://embed.plnkr.co/B0gmQ4OE7aBrhORCxCE1/)):
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
<div ng-if="$ctrl.states._all.activated">

<!-- Do not show successfully deleted item -->
<div ng-repeat="hero in $ctrl.heros"
ng-if="!$ctrl.actions['delete:' + hero._id].loaded">
<h2>{{ hero.name }}
<!-- Cannot delete an hero twice + giving feedback ;) -->
<button ng-click="$ctrl.deleteHero(hero._id)"
ng-disabled="$ctrl.actions['delete:' + hero._id].loading">
{{
 $ctrl.actions['delete:' + hero._id].loading ?
 'Deleting' :
 $ctrl.actions['delete:' + hero._id].failed ?
 'Delete error ' + $ctrl.actions['delete:' + hero._id].failed.message :
 'Delete'
}}
</button>
</h2>
</div>
</div>
<!-- Handle hero list reload wait -->
<p ng-if="$ctrl.states.heros.reloading">
Refreshing...
</p>
```

```js
// Example stolen from the AngularJS documentation
angular
  .module('app.heros.component', ['sf.load', 'app.heros.service'])
  .component('heroList', {
    templateUrl: `heroList.html`,
    controller: HeroListController
  });

function HeroListController(sfLoadService, herosService, $q) {
  var ctrl = this;

  ctrl.deleteHero = deleteHero;

  ctrl.$onInit = activate;

  function activate() {
    $q.all(sfLoadService.loadState(ctrl, {
      heros: herosService.list(),
      categories: herosService.getCategories(),
    })).then(function(data) {
      ctrl.heros = data.heros;
      ctrl.categories = data.categories;
    });
  }

  function deleteHero(heroId) {
    sfLoadService.runState(
      ctrl,
      'delete:' + heroId,
      herosService.delete(heroId)
    ).then(activate);
  }
}
```

You can also see real world usage [here](https://github.com/nfroidure/TripStory).
