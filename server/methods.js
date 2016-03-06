'use strict';
import {Roles} from 'meteor/alanning:roles';
import {check} from 'meteor/check';
import {Email} from 'meteor/email';
import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {Cars} from '/collections/collections.js';
import {Schemas} from '/collections/schemas.js';
import {Images} from '/server/collections.js';
import {EmailBuilder} from '/server/email_builder.js';


// Wrap the check function in a object to be able to stub/spy it
export const Check = {
  check() {
    return check;
  }
};


Meteor.methods({
  createAd: (doc) => {
    console.log('Meteor.methods.createAd: Entering method');
    const session = doc.session;

    Schemas.Car.clean(doc, {
      extendAutoValueContext: {
        isInsert: true,
        isUpdate: false,
        isUpsert: false,
        isFromTrustedCode: false
      }
    });

    // Important server-side check for security and data integrity
    Check.check(doc, Schemas.Car);

    console.log('Inserting ad with values: ');
    console.log(doc);
    const id = Cars.insert(doc);

    Images.update({session: session}, {
      $set: {assigned: id}}, {multi: true});

    const admins = Roles.getUsersInRole('admin').fetch();
    _.each(admins, (admin) => {
      const data = EmailBuilder.adminNewAd({
        to: admin.emails[0].address,
        make: doc.make,
        title: doc.title,
        id
      });
      Meteor.defer(() => {
        Email.send(data);
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
    const car = Cars.findOne(carId);
    if (! car) {
      throw new Meteor.Error('403', 'You are not authorized to access this content');
    } else if (car && car['userId']) {
      throw new Meteor.Error('403', 'You are not authorized to access this content');
    }
    Cars.update({_id: carId}, {$set: {userId: userId}});
  }
});
