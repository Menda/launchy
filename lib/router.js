///////////////
// Public pages

FlowRouter.route('/', {
  name: 'home',
  action: function() {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Compra y venta de coches de gama alta, clásicos y de disfrute',
      metaDescription: 'Para tu parienta un trasto caro, para nosotros una pasión y un estilo ' +
                       'de vida. Vende o compra aquí tu coche platónico; anuncios de alta ' +
                       'calidad.'
    });
    BlazeLayout.render('applicationLayout', {main: this['name']});
  }
});

FlowRouter.route('/coches', {
  name: 'cars',
  action: function() {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Mercado de automóviles de lujo',
      metaDescription: 'Echa un vistazo a toda la gama de coches de gama alta, exclusivos, ' +
                       'clásicos y de disfrute que ofrecemos'
    });
    BlazeLayout.render('applicationLayout', {main: this['name']});
  }
});

FlowRouter.route('/coche/:_id', {
  name: 'carDetails',
  action: function(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef)
    });
    BlazeLayout.render('applicationLayout', {main: this['name']});
  }
});

FlowRouter.route('/crear_anuncio', {
  name: 'createAd',
  action: function(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Crear anuncio de tu coche',
      metaDescription: 'Anunciar tu coche es muy rápido y fácil. Garantizamos la visibilidad ' +
                       'de tu anuncio.'
    });
    BlazeLayout.render('applicationLayout', { main: this['name'] });
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
