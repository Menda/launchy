'use strict';
import {Accounts} from 'meteor/accounts-base';
import {AutoForm} from 'meteor/aldeed:autoform';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {$} from 'meteor/jquery';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {_} from 'meteor/underscore';
//Fs import TODO

import {makeIdOptions, districtOptions, fuelOptions, transmissionOptions,
        wheelDriveOptions, bodyOptions} from '/client/lib/form-options';
import {Images} from '/client/imports/collections.js';
import {Makes, Districts} from '/collections/collections.js';
import {FUELTYPES, TRANSMISSIONTYPES,
        WHEELDRIVETYPES, BODYTYPES} from '/collections/constants.js';
import {Forms} from '/collections/forms.js';


if (Meteor.settings.public.environment === 'development'|'staging') {
    SimpleSchema.debug = true;
    AutoForm.debug();
}

// Clean success page variable
Template.createAd.created = () => {
  Session.set('successfulAd', false);
  Session.set('random', Random.id());
  Session.set('carId', null);
  Session.set('finishedAd', false);
};
Template.createAd.destroyed = () => {
  Session.set('successfulAd', false);
  Session.set('destroyed random', null);
  Session.set('carId', null);
  Session.set('finishedAd', false);
};

Template.createAd.helpers({
  isSuccessfulAd() {
    return Session.get('successfulAd');
  },
  isFinishedAd() {
    return Session.get('finishedAd');
  },
  createAdForm() {
    return Forms.createAdForm;
  },
  makeIdOptions,
  districtOptions,
  fuelOptions,
  transmissionOptions,
  wheelDriveOptions,
  bodyOptions,
  uploadedImages() {
    return Images.find({session: Session.get('random')});
  }
});

Template.createAd.events({
  'change #form-makeId': (evt) => {
    const allowed = $(evt.target).find(':selected').data('allowed');
    if (allowed == false) {
      console.log('Disable form and display error');
    }
  }
});

AutoForm.hooks({
  'createAdForm': {
    formToDoc(doc) {
      // Set District
      const districtId = AutoForm.getFieldValue('districtId'); // or doc['districtId']
      if (districtId) {
        const district = Districts.findOne({'_id': districtId});
        delete district['_id']; // we need to delete it because it's not in the schema
        if (district) {
          doc.district = district;
        }
      }

      // Build contact
      const email = AutoForm.getFieldValue('email');
      const phone = AutoForm.getFieldValue('phone');
      const fullname = AutoForm.getFieldValue('fullname');
      if ((email || phone) && fullname) {
        doc['contact'] = {};
        if (email) {
          doc.contact.email = email;
        }
        if (phone) {
          doc.contact.phone = phone;
        }
        if (fullname) {
          doc.contact.fullname = fullname;
        }
      }

      // We need to convert string value to boolean in order to validate
      doc['tc'] = $('#form-tc').is(':checked');

      // Current session, so pictures are assigned to current Ad
      doc['session'] = Session.get('random');
      if (Meteor.userId()) {
        doc['userId'] = Meteor.userId();
        Session.set('finishedAd', true);
      }
      return doc;
    },
    onSuccess(formType, result) {
      console.log('Form "createAdForm" sent successfully!');
      Session.set('carId', result);
      return Session.set('successfulAd', true);
    }
  }
});

/**
 * Replace for original FS.EventHandlers.insertFiles function.
 */
export function cfsInsertFiles(collection, options) {
  options = options || {};
  var afterCallback = options.after;
  var metadataCallback = options.metadata;

  function insertFilesHandler(event) {
    FS.Utility.eachFile(event, function(file) {
      var f = new FS.File(file);
      var maxChunk = 2097152;
      FS.config.uploadChunkSize =
        (f.original.size < 10 * maxChunk) ? f.original.size / 10 : maxChunk;
      if (metadataCallback) {
        FS.Utility.extend(f, metadataCallback(f));
      }
      collection.insert(f, afterCallback);
    });
  }

  return insertFilesHandler;
}

/**
 * Image handling methods
 */
function getHandler(dropped) {
  return cfsInsertFiles(Images, {
    metadata(fileObj) {
      return {
        // TODO: return width and height
        session: Session.get('random'),  // util variable
        assigned: false  // image assigned to a created Ad
      };
    },
    after(error, fileObj) {
      if (! error) {
        console.log('Image inserted', fileObj.name());
      }
      // We need to clean the input file, because after adding the files,
      // the value of it is not cleaned.
      let inputFile = $('#form-images');
      inputFile.replaceWith(inputFile = inputFile.clone(true));
    }
  });
}

// Can't call getHandler until startup so that Images object is available
// This is loaded anywhere (at any URL) in the app only once it's started.
Meteor.startup(() => {
  Template.createAd.events({
    'dropped .imageArea': getHandler(true),
    'dropped .imageDropArea': getHandler(true),
    'change input.images': getHandler(false)
  });
});

// If the user created the ad, but did not log in, then we react over
// login and we check if the random session variable is set
Accounts.onLogin(() => {
  const userId = Meteor.userId();
  const carId = Session.get('carId');
  if (userId && carId) {
    Meteor.call('assignAccountAd', userId, carId);
    Session.set('carId', null);  // delete var to avoid more calls
    Session.set('finishedAd', true);
  }
});
