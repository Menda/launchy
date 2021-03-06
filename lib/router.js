'use strict';
import {BlazeLayout} from 'meteor/kadira:blaze-layout'
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';

import {setHead, scrollToTop} from '/lib/utils.js';


///////////////
// Public pages

FlowRouter.route('/', {
  name: 'home',
  subscriptions: function(params) {
    this.register('lastAddedCars', Meteor.subscribe('lastAddedCars', 8));
    this.register('lastAddedExternalCars', Meteor.subscribe('lastAddedExternalCars', 8));
    this.register('lastBlogposts', Meteor.subscribe('lastBlogposts'));
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

FlowRouter.route('/unicos', {
  name: 'externalCars',
  subscriptions: function(params) {
    // TODO this 300 needs to be changed
    this.register('lastAddedExternalCars', Meteor.subscribe('lastAddedExternalCars', 300));
  },
  action() {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Coches exclusivos y únicos en su especie',
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

FlowRouter.route('/pre-crear-anuncio', {
  name: 'preCreateAd',
  subscriptions: function(params) {
    this.register('lastClosedCars', Meteor.subscribe('lastClosedCars', 4));
  },
  action(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Anunciar tu coche de gama alta gratuitamente',
      metaDescription: 'Anunciar tu coche es muy rápido y fácil. Garantizamos la visibilidad ' +
                       'de tu anuncio.'
    });
    BlazeLayout.render('applicationLayout', { main: this['name'] });
    scrollToTop();
  }
});

FlowRouter.route('/crear-anuncio', {
  name: 'createAd',
  subscriptions: function(params) {
    this.register('districts', Meteor.subscribe('districts'));
    this.register('makes', Meteor.subscribe('makes'));
  },
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

FlowRouter.route('/libro', {
  name: 'book',
  action(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Libro-Manual: Fotografía y publica tu coche como un Profesional'
    });
    BlazeLayout.render('applicationLayout', { main: this['name'] });
    scrollToTop();
  }
});

//////////////////
// Protected pages

var loggedInRoutes = FlowRouter.group({
  // This is only triggered on client
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

loggedInRoutes.route('/editar-anuncio/:_id', {
  name: 'editAd',
  subscriptions: function(params) {
    // TODO Cómo hacer que no se devuelvan los detalles del coche (carDetails) si no es admin
    // y no es el propietario de dicho anuncio
    this.register('carDetailsEdit', Meteor.subscribe('carDetailsEdit', params._id));
    this.register('districts', Meteor.subscribe('districts'));
    this.register('makes', Meteor.subscribe('makes'));
  },
  action(params) {
    setHead({
      currentUrl: FlowRouter.url(this.pathDef),
      title: 'Editar tu anuncio'
    });
    BlazeLayout.render('applicationLayout', { main: this['name'] });
    scrollToTop();
  }
});
