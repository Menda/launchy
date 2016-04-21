'use strict';
import {BlazeLayout} from 'meteor/kadira:blaze-layout'
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';

import {setHead, scrollToTop} from '/lib/utils.js';

// TODO
// See: https://meteorhacks.com/flow-router-and-subscription-management/

///////////////
// Public pages

FlowRouter.route('/', {
  name: 'home',
  subscriptions: function(params) {
    this.register('lastAddedCars', Meteor.subscribe('lastAddedCars', 8));
  },
  action() {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Compra y venta de coches de gama alta, clásicos y de disfrute',
      metaDescription: 'Para algunos un trasto caro, para nosotros una pasión y un estilo ' +
                       'de vida. Vende o compra aquí tu coche platónico; anuncios de alta ' +
                       'calidad'
    });
    BlazeLayout.render('applicationLayout', {main: this['name']});
    scrollToTop();
  }
});

FlowRouter.route('/coches', {
  name: 'cars',
  subscriptions: function(params) {
    // TODO this 300 needs to be changed
    this.register('lastAddedCars', Meteor.subscribe('lastAddedCars', 300));
  },
  action() {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Mercado de automóviles de lujo',
      metaDescription: 'Echa un vistazo a toda la gama de coches de gama alta, exclusivos, ' +
                       'clásicos y de disfrute que ofrecemos'
    });
    BlazeLayout.render('applicationLayout', {main: this['name']});
    scrollToTop();
  }
});

FlowRouter.route('/coche/:_id', {
  name: 'carDetails',
  subscriptions: function(params) {
    this.register('carDetails', Meteor.subscribe('carDetails', params._id));
  },
  action(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef)
    });
    BlazeLayout.render('applicationLayout', {main: this['name']});
    scrollToTop();
  }
});

FlowRouter.route('/crear-anuncio', {
  name: 'createAd',
  action(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Crear anuncio de tu coche',
      metaDescription: 'Anunciar tu coche es muy rápido y fácil. Garantizamos la visibilidad ' +
                       'de tu anuncio.'
    });
    BlazeLayout.render('applicationLayout', { main: this['name'] });
    scrollToTop();
  }
});

FlowRouter.route('/conocenos', {
  name: 'meetUs',
  action(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Conócenos'
    });
    BlazeLayout.render('applicationLayout', { main: this['name'] });
    scrollToTop();
  }
});

FlowRouter.route('/terminos-y-condiciones', {
  name: 'termsAndConditions',
  action(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Términos y Condiciones'
    });
    BlazeLayout.render('applicationLayout', { main: this['name'] });
    scrollToTop();
  }
});

//////////////////
// Protected pages

var loggedInRoutes = FlowRouter.group({
  triggersEnter: [(context, redirect) => {
    if (! (Meteor.loggingIn() || Meteor.userId())) {
      BlazeLayout.render('applicationLayout', { main: '404' });
      throw new Error('404');
    }
  }]
});

loggedInRoutes.route('/mis-anuncios', {
  name: 'myAds',
  action(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Mis anuncios',
      metaDescription: ''
    });
    BlazeLayout.render('applicationLayout', { main: this['name'] });
    scrollToTop();
  }
});
