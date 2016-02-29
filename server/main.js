'use strict';
import {FS} from 'meteor/cfs:base-package';
import {check} from 'meteor/check';
import {Email} from 'meteor/email';
import {Meteor} from 'meteor/meteor';

import {Cars} from '/collections/collections.js';
import {Schemas} from '/collections/schemas.js';
import {Images} from '/server/collections.js';


function checkEnvVars() {
  console.log('Checking environment variables...');
  if (! Meteor.settings.public.environment) {
    throw new Error('--settings are missing');
  }
  console.log('All OK!');
}

/**
 * Image upload and handling settings.
 */
function setFSSettings() {
  if (Meteor.settings.public.environment === 'development'|'staging') {
    FS.debug = true; // enable CFS debug logging
  }

  // default GET request headers
  FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
  ]);
}

Meteor.startup(() => {
  checkEnvVars();
  setFSSettings();
  console.log(`You are running environment: ${Meteor.settings.public.environment}`);
});

Meteor.methods({
  createAd: (doc) => {
    console.log('Meteor.methods.createAd: Entering method');
    var session = doc.session;

    Schemas.Car.clean(doc, {
      extendAutoValueContext: {
        isInsert: true,
        isUpdate: false,
        isUpsert: false,
        isFromTrustedCode: false
      }
    });

    // Important server-side check for security and data integrity
    check(doc, Schemas.Car);

    console.log('Inserting ad with values: ');
    console.log(doc);
    var id = Cars.insert(doc);

    Images.update({session: session}, {
      $set: {assigned: id}}, {multi: true});

    Meteor.defer(() => {
      console.log(doc);
      const admins = Roles.getUsersInRole('admin').fetch();
      _.each(admins, (admin) => {
        Email.send({
          from: Meteor.settings.private.emails.from,
          to: admin.email,
          subject: `Nuevo anuncio: ${doc.make} ${doc.title}`,
          text: `ID: ${id}`
        });
      });
    });

    return id;
  },

  /**
   * Assigns an advertisement to a certain user. For security reasons, already assigned ads cannot
   * be assigned again.
   */
  assignAccountAd: (userId, carId) => {
    console.log(`Meteor.methods.assignAccountAd: Entering method. ` +
                `userId: {userId}, carId: {carId}`);
    if (! userId || ! carId) {
      throw new Meteor.Error('403', 'You are not authorized to access this content');
    }
    var car = Cars.findOne(carId);
    if (! car) {
      throw new Meteor.Error('403', 'You are not authorized to access this content');
    } else if (car && car['userId']) {
      throw new Meteor.Error('403', 'You are not authorized to access this content');
    }
    Cars.update({_id: carId}, {$set: {userId: userId}});
  }
});
