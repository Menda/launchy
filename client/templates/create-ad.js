'use strict';
import {Accounts} from 'meteor/accounts-base';
import {AutoForm} from 'meteor/aldeed:autoform';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {$} from 'meteor/jquery';
import {UploadCarePlus} from 'meteor/natestrauser:uploadcare-plus';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {_} from 'meteor/underscore';

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
  Session.set('carId', null);
  Session.set('finishedAd', false);

  UploadCarePlus.load();
};

Template.createAd.destroyed = () => {
  Session.set('successfulAd', false);
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
  uploadcareApiKey() {
    return Meteor.settings.public.uploadcare_api_key;
  },
  makeIdOptions,
  districtOptions,
  fuelOptions,
  transmissionOptions,
  wheelDriveOptions,
  bodyOptions
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

      // Uploadcare Group ID
      doc['uploadcareGroupUrl'] = $('input[role="uploadcare-uploader"]')[0].value;
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

// If the user created the ad, but did not log in, then we react over
// login and we assigned to him the ad.
Accounts.onLogin(() => {
  const userId = Meteor.userId();
  const carId = Session.get('carId');
  if (userId && carId) {
    Meteor.call('assignAccountAd', userId, carId);
    Session.set('carId', null);  // delete var to avoid more calls
    Session.set('finishedAd', true);
  }
});
