'use strict';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Schemas} from '/collections/schemas.js';


export const Forms = {};

// Inherits from Schemas.Car
Forms.createAdForm = new SimpleSchema([Schemas.Car, {
  uploadcareGroupUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  districtId: {
    type: String
  },
  make: {
    type: String,
    optional: true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true,
    custom: function() {
      if (! this.siblingField('phone').value && ! this.value) {
        return 'min-email-required';
      }
    }
  },
  phone: {
    type: String,
    max: 20,
    optional: true,
    custom: function() {
      if (! this.siblingField('email').value && ! this.value) {
        return 'min-phone-required';
      }
    }
  },
  fullname: {
    type: String,
    max: 40
  },
  tc: {
    type: Boolean,
    defaultValue: false,
    custom() {
      if (! this.value) {
        return 'tc-required';
      }
    }
  }
}]);

Forms.contactOwnerFormSchema = new SimpleSchema({
  carId: {
    type: String
  },
  name: {
    type: String,
    max: 50
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  message: {
    type: String,
    max: 1000
  }
});

SimpleSchema.messages({
  'tc-required': 'Para crear el anuncio es obligatorio aceptar los términos y condiciones',
  'min-email-required': 'Debes indicar al menos un email si no has rellenado un teléfono',
  'min-phone-required': 'Debes indicar al menos un teléfono si no has rellenado un email'
});
