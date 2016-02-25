'use strict';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Schemas} from '/collections/schemas.js';


export const Forms = {};

// Inherits from Schemas.Car
Forms.createAdForm = new SimpleSchema([Schemas.Car, {
  districtId: {
    type: String
  },
  make: {
    type: String,
    optional: true
  },
  tc: {
    type: Boolean,
    defaultValue: false,
    custom() {
      if (! this.value) {
        return 'tc-required';
      }
    }
  },
  session: {  // used for assigning pictures to the ad
    type: String
  }
}]);

SimpleSchema.messages({
  'tc-required': 'Para crear el anuncio es obligatorio aceptar los términos y condiciones'
});
