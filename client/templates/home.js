'use strict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';

import {Images} from '/client/imports/collections.js';
import {Cars, Blogposts} from '/collections/collections.js';


Template.home.helpers({
  cars() {
    const cars = Cars.find({}).fetch();
    cars.forEach((car) => {
      car.image = Images.findOne({assigned: car['_id']});
    });
    return cars;
  },
  blogposts() {
    return Blogposts.find({}).fetch();
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
