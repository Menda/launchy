'use strict';
import {AutoForm} from 'meteor/aldeed:autoform';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Template} from 'meteor/templating';
import {_} from 'meteor/underscore';
//Accounts import TODO
//Forms import TODO
//Session import TODO
//Fs import TODO

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
  makeIdOptions() {
    return Makes.find().map((m) => {
      return {'label': m.name, 'value': m._id, 'data-allowed': m.allowed};
    });
    return options;
  },
  districtOptions() {
    const options = [];
    const districts = Districts.find().fetch();
    const groupedDistricts = _.groupBy(districts, (district) => {
      return district['region'];
    });
    const sortedRegions = _.keys(groupedDistricts).sort();
    sortedRegions.forEach((region) => {
      const suboptions = [];
      groupedDistricts[region].forEach((district) => {
        suboptions.push({
          label: district['district'],
          value: district['_id']
        });
      });
      options.push({
        optgroup: region,
        options: suboptions
      });
    });
    return options;
  },
  fuelOptions() {
    return Object.keys(FUELTYPES).map((value, index) => {
      return {'label': FUELTYPES[value]['es'], 'value': value};
    });
  },
  transmissionOptions() {
    return Object.keys(TRANSMISSIONTYPES).map((value, index) => {
      return {'label': TRANSMISSIONTYPES[value]['es'], 'value': value};
    });
  },
  wheelDriveOptions() {
    return Object.keys(WHEELDRIVETYPES).map((value, index) => {
      return {'label': WHEELDRIVETYPES[value]['es'], 'value': value};
    });
  },
  bodyOptions() {
    return Object.keys(BODYTYPES).map((value, index) => {
      return {'label': BODYTYPES[value]['es'], 'value': value};
    });
  },
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
 * Image handling methods
 */
function getHandler(dropped) {
  return FS.EventHandlers.insertFiles(Images, {
    metadata(fileObj) {
      return {
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
