'use strict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';


Template.preCreateAd.helpers({
  urlCreateAd() {
    return FlowRouter.path('createAd');
  }
});
