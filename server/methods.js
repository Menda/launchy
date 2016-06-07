'use strict';
import {Roles} from 'meteor/alanning:roles';
import {check} from 'meteor/check';
import {Email} from 'meteor/email';
import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {Cars} from '/collections/collections.js';
import {Forms} from '/collections/forms.js';
import {Schemas} from '/collections/schemas.js';
import {getResizeDimensions} from '/lib/utils.js';
import {Images} from '/server/collections.js';
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
   * Updates all images which don't have metadata associated.
   * TODO deprecate
   */
  updateImages: function() {
    console.log('Meteor.methods.updateImages: Entering method');
    if (! isWorker(this.userId)) {
      throw new Meteor.Error('403', 'You are not authorized');
    } else {
      const images = Images.find({});
      images.forEach((img) => {
        if (! img.url()) {
          return;
        }
        if (img.metadata && img.metadata.width && img.metadata.height) {
          console.log(`Image ${img.url()} with metadata`);
        } else {
          console.log(`Image ${img.url()} without metadata`);
          const url = getAbsoluteUrl(img.url());
          console.log(`Checking URL: ${url}`);
          gm(url).size({bufferStream: true}, FS.Utility.safeCallback(
            (err, size) => {
              if (! size) {
                console.log(err);
                return false;
              }
              const calcSize = getResizeDimensions(size.width, size.height, 1280, 960);
              console.log(`Size found for ${url}: [${calcSize}]`);
              Images.update({_id: img._id}, {$set: {
                'metadata.width': calcSize[0], 'metadata.height': calcSize[1]}});
            }
          ));
        }
      });
    }
  },

  /**
   * Migrates all images to the Uploadcare solution. It doesn't work on localhost.
   */
  migrateImages: function() {
    console.log('Meteor.methods.migrateImages: Entering method');
    if (! isWorker(this.userId)) {
      throw new Meteor.Error('403', 'You are not authorized');
    } else {
      const cars = Cars.find({}).fetch();
      cars.forEach((car) => {
        if (car.images) {
          console.log(`${car.make} ${car.title} (${car._id}) has already ported images`);
          return;
        }
        const imagesOld = Images.find({assigned: car._id}).fetch();
        const uploadcare = new Uploadcare();
        const images = [];
        imagesOld.forEach((img) => {
          if (! img.url()) {
            return;
          }

          if (! img.metadata) {
            return;
          }

          const url = getAbsoluteUrl(img.url());
          console.log(`Migrating image: ${url}`);
          const response = uploadcare.uploadFileFromUrl(url);

          const size = `${img.metadata.width}x${img.metadata.height}`;
          const uuid = response.uuid;
          const imageResult = uploadcare.saveImage(uuid, size);

          const [measuredThumbSize, measuredThumbWidth, measuredThumbHeight] =
            Uploadcare.getImageSize(
              uuid, img.metadata.width, img.metadata.height,
              Meteor.settings.private.uploadcare.size_thumb);
          const thumbResult = uploadcare.saveImage(uuid, measuredThumbSize);

          images.push({
            image: {
              uuid: uuid,
              url: imageResult.headers.location.replace('http:', ''),
              size: {
                height: img.metadata.height,
                width: img.metadata.width
              }
            },
            thumb: {
              uuid: uuid,
              url: thumbResult.headers.location.replace('http:', ''),
              size: {
                width: measuredThumbWidth,
                height: measuredThumbHeight
              }
            }
          });

        });
        Cars.update({_id: car._id}, {$set: {images: images}});
      });
    }
  }
});
