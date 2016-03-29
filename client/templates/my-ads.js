'use strict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';

import {Images} from '/client/imports/collections.js';
import {Cars} from '/collections/collections.js';


Template.myAds.created = () => {
  Session.set('loading', true);
  Meteor.call('getMyAds', (error, result) => {
    Session.set('loading', false);
    Session.set('ads', result);
  });
};
Template.myAds.destroyed = () => {
  Session.set('ads', null);
};

Template.myAds.helpers({
  loading() {
    return Session.get('loading');
  },
  ads() {
    return Session.get('ads');
  }
});

Template.adDetails.helpers({
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
