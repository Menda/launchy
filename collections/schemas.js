'use strict';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Makes} from '/collections/collections.js';
import {FUELTYPES, TRANSMISSIONTYPES,
        BODYTYPES, WHEELDRIVETYPES} from '/collections/constants.js';


export const Schemas = {};

Schemas.Make = new SimpleSchema({
  name: {
    type: String,
    max: 70
  },
  description: {
    type: String,
    optional: true
  },
  allowed: {
    type: Boolean,
    optional: true
  },
  _value: {
    type: String
  }
});

Schemas.District = new SimpleSchema({
  country: {
    type: String
  },
  region: {
    type: String
  },
  district: {
    type: String
  }
});

Schemas.Contact = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phone: {
    type: String,
    max: 20,
    optional: true
  },
  fullname: {
    type: String,
    max: 40
  }
});

Schemas.Car = new SimpleSchema({
  makeId: {
    type: String
  },
  make: {
    type: String,
    max: 70,
    autoValue() {
      const value = this.field('makeId')['value'];
      const make = Makes.findOne(value);
      if (! make && value) {
        throw new Error('Make not found. ID: ' + this.field('makeId')['value']);
      } else if (! make) {
        return;
      }
      if (this.isInsert) {
        return make['name'];
      } else if (this.isUpsert) {
        return make['name'];
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  modelId: { // TODO
    type: Meteor.ObjectID,
    optional: true
  },
  engineId: { // TODO
    type: Meteor.ObjectID,
    optional: true
  },
  title: {
    type: String,
    max: 200
  },
  district: {
    type: Schemas.District
  },
  price: {
    type: Number,
    min: 1
  },
  fuel: {
    type: String,
    allowedValues: Object.keys(FUELTYPES)
  },
  transmission: {
    type: String,
    allowedValues: Object.keys(TRANSMISSIONTYPES)
  },
  year: {
    type: Number,
    min: 1900
  },
  kilometers: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    max: 10000
  },
  contact: {
    type: Schemas.Contact
  },

  // Optional fields
  color: {
    type: String,
    max: 100,
    optional: true
  },
  doors: {
    type: Number,
    optional: true,
    min: 2
  },
  body: {
    type: String,
    allowedValues: Object.keys(BODYTYPES),
    optional: true
  },
  horsepower: {
    type: Number,
    optional: true,
    min: 1,
    max: 2000
  },
  wheelDrive: {
    type: String,
    allowedValues: Object.keys(WHEELDRIVETYPES),
    optional: true
  },
  owners: {
    type: Number,
    optional: true,
    min: 1,
    max: 20
  },
  maintenance: {
    type: String,
    optional: true,
    max: 1000,
  },
  warranty: {
    type: String,
    optional: true,
    max: 1000,
  },

  // Metadata
  userId: {
    type: String,
    optional: true
  },
  published: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  active: {
    type: Boolean,
    defaultValue: true
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  }
});
