'use strict';
import {FS} from 'meteor/cfs:base-package';
import {Meteor} from 'meteor/meteor';

import {Stores} from '/client/imports/stores.js';


// On the client just create a generic FS Store as don't have
// access (or want access) to S3 settings on client
export const Images = new FS.Collection('images', {
  stores: [
    Stores.images,
    Stores.thumbs
  ],
  filter: {
    maxSize: 20 * 1024 * 1024, //in bytes
    allow: {
      contentTypes: ['image/*']
    },
    onInvalid: (message) => {
      alert(message);
    }
  }
});

Meteor.subscribe('districts');
Meteor.subscribe('makes');
Meteor.subscribe('cars');
Meteor.subscribe('images');
