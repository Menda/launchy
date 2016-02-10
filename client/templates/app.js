// Common variables for the whole application
Template.appHeader.helpers({
  siteName: function() {
    return Meteor.settings.public.site_name;
  },
  urlHome: function() {
    return FlowRouter.path('home');
  },
  urlCars: function() {
    return FlowRouter.path('cars');
  },
  urlCreateAd: function() {
    return FlowRouter.path('createAd');
  }
});
