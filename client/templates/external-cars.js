'use strict';
import {Template} from 'meteor/templating';

import {Cars} from '/collections/collections.js';


Template.externalCars.helpers({
  cars() {
    const cars = Cars.find({published: true, active: true, 'contact.externalUrl': {$ne: null}},
                           {sort: {createdAt: -1}}).fetch();
    return cars;
  }
});
