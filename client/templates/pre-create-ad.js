'use strict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';

import {Cars} from '/collections/collections.js';


Template.preCreateAd.helpers({
  urlCreateAd() {
    return FlowRouter.path('createAd');
  },
  soldCars() {
    const cars = Cars.find({published: true, active: false}, {sort: {updatedAt: -1}}).fetch();
    return cars;
  }
});
