'use strict';
import {Roles} from 'meteor/alanning:roles';
import {check} from 'meteor/check';
import {Email} from 'meteor/email';
import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {Cars} from '/collections/collections.js';
import {Forms} from '/collections/forms.js';
import {Schemas} from '/collections/schemas.js';
import {getResizeDimensions, safeCallback} from '/lib/utils.js';
import {EmailBuilder} from '/server/email_builder.js';
import {Uploadcare} from '/server/uploadcare.js';


// Wrap the check function in a object to be able to stub/spy it
export const Check = {
  check() {
    return check;
  }
};

/**
 * @summary Checks if user has privileges as admin or employee.
 * @param {String} userId
 * @return {Boolean}
 */
function isWorker(userId) {
  if (userId) {
    const isWorker = Roles.userIsInRole(userId, ['admin', 'employee']);
    if (isWorker) {
      return true;
    }
  }
  return false;
}

function getAbsoluteUrl(partialUrl) {
  var url = Meteor.absoluteUrl() + partialUrl;
  url = url.replace(/([^:]\/)\/+/g, "$1");
  url = url.replace("https", "http");
  url = url.replace(" ", "%20");
  return url;
}

Meteor.methods({
  createAd: function(doc) {
    console.log('Meteor.methods.createAd: Entering method');
    const uploadcareGroupId = Uploadcare.getGroupId(doc.uploadcareGroupUrl);

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

    // Update images asynchronously, as it takes a while to be copied to S3
    Meteor.setTimeout(() => {
      console.log(`Updating car images. Id: ${id}`);
      const uploadcare = new Uploadcare();
      const images = uploadcare.uploadImagesToS3(uploadcareGroupId);
      Cars.update({_id: id}, {$set: {images: images}});
    }, 1000);

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

  updateAd: (doc, carId) => {
    console.log('Meteor.methods.updateAd: Entering method');

    Schemas.Car.clean(doc, {
      extendAutoValueContext: {
        isInsert: false,
        isUpdate: true,
        isUpsert: false,
        isFromTrustedCode: false
      }
    });

    const newDoc  = _.clone(doc.$set);
    var user = Meteor.user();
    // Check if the user is authorized to update the Ad
    if (! Roles.userIsInRole(user, ['admin', 'employee'])) {
      const car = Cars.findOne({'_id': carId, 'userId': user._id});
      if (! car) {
        throw new Meteor.Error('403', 'You are not authorized');
      }
    }
    // We fake this values to pass the check
    newDoc.active = false;
    newDoc.createdAt = new Date();
    Check.check(newDoc, Schemas.Car);

    Cars.update(carId, doc);
  },

  /**
   * Assigns an advertisement to a certain user. For security reasons, already assigned ads cannot
   * be assigned again.
   */
  assignAccountAd: (userId, carId) => {
    // TODO vulnerability. Do not pass userId, get it in the server.
    // Just assigned if it wasn't before assigned.
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
    Check.check(doc, Forms.contactOwnerFormSchema);

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
    console.log(`Meteor.methods.approveAdminAd: Entering method. ` +
                `carId: ${carId}`);
    if (! isWorker(this.userId)) {
      throw new Meteor.Error('403', 'You are not authorized');
    } else {
      Cars.update({_id: carId}, {$set: {published: true}});
    }
  },

  /**
   * Rejects the Ad if the one who makes it is Admin or Employee.
   */
  rejectAdminAd: function(carId) {
    console.log('Meteor.methods.rejectAdminAd: Entering method');
    if (! isWorker(this.userId)) {
      throw new Meteor.Error('403', 'You are not authorized');
    } else {
      Cars.update({_id: carId}, {$set: {active: false}});
    }
  },

  /**
   * Assigns (or deletes if `null`) a external URL to an Ad.
   */
  assignExternalUrl: function(carId, externalUrl) {
    console.log('Meteor.methods.assignExternalUrl: Entering method');
    if (! isWorker(this.userId)) {
      throw new Meteor.Error('403', 'You are not authorized');
    } else {
      Cars.update({_id: carId}, {$set: {'contact.externalUrl': externalUrl}});
    }
  }
});
