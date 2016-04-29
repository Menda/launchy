'use strict';
import {Roles} from 'meteor/alanning:roles';
import {check} from 'meteor/check';
import {Email} from 'meteor/email';
import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {Cars} from '/collections/collections.js';
import {Forms} from '/collections/forms.js';
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

    // TODO move to assignAccountAd better, and set ReplyTo
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
                `userId: ${userId}, carId: ${carId}`);
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
  },

  sendOwnerEmail: (doc) => {
    console.log('Meteor.methods.sendOwnerEmail: Entering method');
    check(doc, Forms.contactOwnerFormSchema);

    const car = Cars.findOne(doc.carId);
    const admins = Roles.getUsersInRole('admin').fetch();
    _.each(admins, (admin) => {
      const data = EmailBuilder.contactOwner({
        car: car,
        to: admin.emails[0].address,
        name: doc.name,
        email: doc.email,
        message: doc.message
      });
      Meteor.defer(() => {
        Email.send(data);
      });
    });
  },

  /**
   * Returns all ads created by the current logged-in user. Needs a server method as we are not
   * publishing sensitive data like 'userId' for every ad, as it can be used to see what
   * every user is posting, and that's not nice.
   * TODO
   * Substitute for a publish and subscription better, and make userId public only
   * for that publish call. See http://stackoverflow.com/a/21853298
   * See also: https://meteorhacks.com/flow-router-and-subscription-management/
   */
  getMyAds: () => {
    const fields = {
      '_id': 1,
      'make': 1,
      'title': 1,
      'published': 1,
      'active': 1
    };
    return Cars.find({'userId': Meteor.userId()}, {fields: fields}).fetch();
  },

  closeAd: (carId) => {
    Cars.update({_id: carId, userId: Meteor.userId(), active: true}, {$set: {active: false}});
    return true;
  },

  /**
   * Approves the Ad if the one who makes it is Admin or Employee.
   */
  approveAdminAd: function(carId) {
    const userId = this.userId;
    if (userId) {
      const isAdmin = Roles.userIsInRole(userId, 'admin');
      const isEmployee = Roles.userIsInRole(userId, 'employee');
      if (isAdmin || isEmployee) {
        Cars.update({_id: carId}, {$set: {published: true}});
      }
    }
  }
});
