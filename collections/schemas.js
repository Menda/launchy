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

Schemas.Car = new SimpleSchema({
  makeId: {
    type: String
  },
  make: {
    type: String,
    max: 70,
    autoValue() {
      var value = this.field('makeId')['value'];
      var make = Makes.findOne(value);
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
  modelId: {
    type: Meteor.ObjectID,
    optional: true
  },
  engineId: {
    type: Meteor.ObjectID,
    optional: true
  },
  title: {
    type: String,
    max: 200
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
  district: {
    type: Schemas.District
  },
  color: {
    type: String,
    max: 100,
    optional: true
  },
  doors: {
    type: Number,
    optional: true
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
  warranty: {
    type: String,
    optional: true
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
