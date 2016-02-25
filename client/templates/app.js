import {FlowRouter} from 'meteor/kadira:flow-router';


// Common variables for the whole application
Template.appHeader.helpers({
  siteName() {
    return Meteor.settings.public.site_name;
  },
  urlHome() {
    return FlowRouter.path('home');
  },
  urlCars() {
    return FlowRouter.path('cars');
  },
  urlCreateAd() {
    return FlowRouter.path('createAd');
  }
});
