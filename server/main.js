Meteor.startup(function () {
  console.log('You are running environment: ' + Meteor.settings.public.environment);
});