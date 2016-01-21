/////////
// Public

FlowRouter.route('/', {
  name: 'home',
  action: function() {
    BlazeLayout.render('applicationLayout', { main: 'home' });
  }
});

FlowRouter.route('/cars', {
  name: 'cars',
  action: function() {
    BlazeLayout.render('applicationLayout', { main: 'cars' });
  }
});

FlowRouter.route( '/ad/:_id', {
  action: function(params, queryParams) {
    console.log(params);
    console.log(queryParams);
  }
});

//////////////////
// Logged in users

var accountRoutes = FlowRouter.group({
  prefix: '/account',
  triggersEnter: [ function(){
    console.log( "ENTER ACCOUNT ROUTE!" );
  }],
  triggersExit: [ function(){
    console.log( "EXIT ACCOUNT ROUTE!" );
  }]
});

accountRoutes.route( '/profile', {
  action: function() {
    console.log( "Okay, we're on the /accounts/profile page!" );
  }
});

////////
// Admin

var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  triggersEnter: [function(context, redirect) {
    console.log('running group triggers');
  }]
});

adminRoutes.route('/', {
  action: function() {
    BlazeLayout.render('componentLayout', {content: 'admin'});
  },
  triggersEnter: [function(context, redirect) {
      if (! Roles.userIsInRole(Meteor.userId(), 'admin')) {
        console.log(Roles.userIsInRole(Meteor.userId(), 'admin'), Meteor.userId());
        FlowRouter.go('home'); // TODO redirect to login page
      }
  }],
  action: function() {
      console.log('running admin page');
  }
});

////////////////////
//404 Page not found

FlowRouter.notFound = {
  // Subscriptions registered here don't have Fast Render support.
  subscriptions: function() {

  },
  action: function() {
    BlazeLayout.render('applicationLayout', { main: '404' });
    console.log('404 not found');
  }
};
