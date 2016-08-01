'use strict';
const humanize = require('humanize');

import {accountsUIBootstrap3} from 'meteor/ian:accounts-ui-bootstrap-3';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import {moment} from 'meteor/mrt:moment';
import {Template} from 'meteor/templating';


accountsUIBootstrap3.setLanguage(Meteor.settings.public.language);

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
  urlPreCreateAd() {
    return FlowRouter.path('preCreateAd');
  }
});

Template.appFooter.helpers({
  urlPreCreateAd() {
    return FlowRouter.path('preCreateAd');
  },
  urlMeetUs() {
    return FlowRouter.path('meetUs');
  },
  urlBook() {
    return FlowRouter.path('book');
  },
  urlTC() {
    return FlowRouter.path('termsAndConditions');
  }
});

Template._loginButtonsAdditionalLoggedInDropdownActions.helpers({
  urlMyAds() {
    return FlowRouter.path('myAds');
  }
});

Template.createAd.helpers({
  urlTC() {
    return FlowRouter.path('termsAndConditions');
  }
});

Template.home.helpers({
  urlCars() {
    return FlowRouter.path('cars');
  }
});

/**
 * Global helpers
 */

Template.registerHelper('formatDate', (date) => {
  return moment(date).fromNow();
});

Template.registerHelper('equals', (a, b) => {
  return a === b;
});

Template.registerHelper('humanizeNumber', (number) => {
  return humanize.numberFormat(number, 0, ',', '.');
});
