'use strict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';

import {Cars, Blogposts} from '/collections/collections.js';


Template.home.helpers({
  cars() {
    const cars = Cars.find({published: true, active: true},
                           {sort: {createdAt: -1}, limit: 8}).fetch();
    return cars;
  },
  blogposts() {
    return Blogposts.find({}, {sort: {createdAt: -1}}).fetch();
  }
});

Template.car.helpers({
  urlCarDetails() {
    const car = this;
    const params = {
      _id: car._id
    };
    const routeName = 'carDetails';
    const path = FlowRouter.path(routeName, params);
    return path;
  }
});
