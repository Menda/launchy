'use strict';
import {FlowRouter} from 'meteor/kadira:flow-router';

import {Images} from '/client/imports/collections.js';
import {makeIdOptions, districtOptions, fuelOptions, transmissionOptions,
        wheelDriveOptions, bodyOptions} from '/client/lib/form-options';
import {cfsInsertFiles} from  '/client/templates/create-ad.js';
import {Cars, Makes, Districts} from '/collections/collections.js';
import {FUELTYPES, TRANSMISSIONTYPES,
        WHEELDRIVETYPES, BODYTYPES} from '/collections/constants.js';
import {Forms} from '/collections/forms.js';


Template.editAd.helpers({
  createAdForm() {
    return Forms.createAdForm;
  },
  currentCar() {
    const car = Cars.findOne();
    // TODO make it in other way than checking if the value is not empty?
    // There should be something like subscriptionReady == true
    if (car) {
      car['email'] = car['contact']['email'];
      car['phone'] = car['contact']['phone'];
      car['fullname'] = car['contact']['fullname'];
      const district = Districts.findOne({'district': car['district']['district']});
      // TODO sometimes the subscription is not prepared and returns 'undefined'
      // There should be a better way to make this
      if (! district) {
        return;
      }
      car['districtId'] = district['_id'];
      const make = Makes.findOne({'name': car['make']});
      // TODO sometimes the subscription is not prepared and returns 'undefined'
      // There should be a better way to make this
      if (! make) {
        return;
      }
      car['makeId'] = make['_id'];
      return car;
    }
  },
  makeIdOptions,
  districtOptions,
  fuelOptions,
  transmissionOptions,
  wheelDriveOptions,
  bodyOptions,
  uploadedImages() {
    return Images.find({});
  }
});

AutoForm.hooks({
  'editAdForm': {
    formToModifier(modifier) {
      // Set District
      const districtId = AutoForm.getFieldValue('districtId'); // or doc['districtId']
      if (districtId) {
        const district = Districts.findOne({'_id': districtId});
        delete district['_id']; // we need to delete it because it's not in the schema
        if (district) {
          modifier.$set.district = district;
        }
      }

      // Build contact
      const email = AutoForm.getFieldValue('email');
      const phone = AutoForm.getFieldValue('phone');
      const fullname = AutoForm.getFieldValue('fullname');
      if ((email || phone) && fullname) {
        modifier.$set.contact = {};
        if (email) {
          modifier.$set.contact.email = email;
        }
        if (phone) {
          modifier.$set.contact.phone = phone;
        }
        if (fullname) {
          modifier.$set.contact.fullname = fullname;
        }
      }

      // We need to convert string value to boolean in order to validate
      modifier.$set.tc = $('#form-tc').is(':checked');

      return modifier;
    },
    onSuccess(formType, result) {
      console.log('Form "editAdForm" sent successfully!');
      const carId = FlowRouter.getParam('_id');
      const carDetailsPath = FlowRouter.path('carDetails', {_id: carId}) + '?edited=true';
      FlowRouter.redirect(carDetailsPath);
    }
  }
});

/**
 * Image handling methods
 */
function getHandler(dropped) {
  return cfsInsertFiles(Images, {
    metadata(fileObj) {
      return {
        assigned: FlowRouter.getParam('_id') // assign to this carId
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
  Template.editAd.events({
    'dropped .imageArea': getHandler(true),
    'dropped .imageDropArea': getHandler(true),
    'change input.images': getHandler(false)
  });
});
