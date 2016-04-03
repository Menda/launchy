'use strict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';

import {Images} from '/client/imports/collections.js';
import {Cars} from '/collections/collections.js';
import {Forms} from '/collections/forms.js';
import {setHead} from '/lib/utils.js';


Template.carDetails.onRendered(() => {
  // TODO bug:
  // Si se recarga la página de detalles de coche salen una serie de excepciones
  // porque las colecciones no están cargadas todavía, y devuelve 0 resultados.
  // Fix: https://forums.meteor.com/t/collection-not-available-onrendered-when-using-flow-router-solved/8105
  const carId = FlowRouter.getParam('_id');
  const car = Cars.findOne({'_id': carId},
                         {fields: {'make': 1, 'title': 1, 'district.district': 1}});
  const title = `${car['make']} ${car['title']} en venta en ${car['district']['district']}`;
  let metaDescription;
  if (car['make'] == 'Volkswagen') {
    metaDescription = '"Das Auto". Un lema tan simple no puede decir más. VW es una de las ' +
                      'marcas más legendarias de Alemania destinadas al público general.';
  } else if (car['make'] == 'Lotus') {
    metaDescription = 'Lotus ofrece no solamente tradición de la mano de la ingeniería, sino ' +
                      'que además han anteponen las sensaciones y la ligereza de sus chasis'
                      'al caballaje';
  }
  setHead({
    currentUrl: '', // TODO
    title: title,
    metaDescription: metaDescription
  });
});

Template.carDetails.created = () => {
  Session.set('showContactOwnerForm', false);
};

Template.carDetails.destroyed = () => {
  Session.set('showContactOwnerForm', false);
};

Template.carDetails.helpers({
  showContactOwnerForm() {
    return Session.get('showContactOwnerForm');
  },
  car() {
    const carId = FlowRouter.getParam('_id');
    const car = Cars.findOne({'_id': carId});
    car.images = Images.find({assigned: car['_id']}).fetch();
    return car;
  },
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

Template.carDetails.events({
  'click #contact-owner': () => {
    $('html, body').animate({scrollTop: $("#contact-owner").offset().top});
    Session.set('showContactOwnerForm', true);
  }
});


///////////////////
// contactOwnerForm

Template.contactOwnerForm.created = () => {
  Session.set('successfulContactOwner', false);
};

Template.contactOwnerForm.destroyed = () => {
  Session.set('successfulContactOwner', false);
};

Template.contactOwnerForm.helpers({
  contactOwnerFormSchema() {
    return Forms.contactOwnerFormSchema;
  },
  isSuccessfulContactOwner() {
    return Session.get('successfulContactOwner');
  }
});

AutoForm.hooks({
  'contactOwnerForm': {
    onSuccess(formType, result) {
      console.log('Form "contactOwnerForm" sent successfully!');
      Session.set('successfulContactOwner', true);
    }
  }
});
