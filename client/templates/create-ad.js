if (Meteor.settings.public.environment === 'development'|'staging') {
    SimpleSchema.debug = true;
    AutoForm.debug();
}

Template.createAd.helpers({
  isSuccessfulAd: function() {
    return Session.get('successfulAd');
  },
  createAdForm: function() {
    return Forms.createAdForm;
  },
  makeIdOptions: function () {
    return Makes.find().map(function (m) {
      return {'label': m.name, 'value': m._id, 'data-allowed': m.allowed};
    });
    return options;
  },
  districtOptions: function () {
    var options = [];
    var districts = Districts.find().fetch();
    var groupedDistricts = _.groupBy(districts, function(district) {
      return district['region'];
    });
    var sortedRegions = _.keys(groupedDistricts).sort();
    sortedRegions.forEach(function(region){
      var suboptions = [];
      groupedDistricts[region].forEach(function(district) {
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
  fuelOptions: function () {
    return Object.keys(FUELTYPES).map(function(value, index) {
      return {'label': FUELTYPES[value]['es'], 'value': value};
    });
  },
  transmissionOptions: function () {
    return Object.keys(TRANSMISSIONTYPES).map(function(value, index) {
      return {'label': TRANSMISSIONTYPES[value]['es'], 'value': value};
    });
  },
  wheelDriveOptions: function () {
    return Object.keys(WHEELDRIVETYPES).map(function(value, index) {
      return {'label': WHEELDRIVETYPES[value]['es'], 'value': value};
    });
  },
  bodyOptions: function () {
    return Object.keys(BODYTYPES).map(function(value, index) {
      return {'label': BODYTYPES[value]['es'], 'value': value};
    });
  }
});

Template.createAd.events({
  'change #form-makeId': function (evt) {
    var allowed = $(evt.target).find(':selected').data('allowed');
    if (allowed == false) {
      console.log('Disable form and display error');
    }
  }
});

Template.createAd.created = function() {
  return Session.set('successfulAd', false);
};

Template.createAd.destroyed = function() {
  return Session.set('successfulAd', false);
};

AutoForm.hooks({
  'createAdForm': {
    formToDoc: function(doc) {
      // Set District
      var districtId = AutoForm.getFieldValue('districtId'); // or doc['districtId']
      if (districtId) {
        var district = Districts.findOne({"_id": districtId});
        delete district['_id']; // we need to delete it because it's not in the schema
        if (district) {
          doc.district = district;
        }
      }

      // We need to convert string value to boolean in order to validate
      doc['tc'] = $("#form-tc").is(':checked');
      return doc;
    },
    onSuccess: function(formType, result) {
      console.log('Form "createAdForm" sent successfully!');
      return Session.set('successfulAd', true);
    }
  }
});

function getHandler(dropped) {
  return FS.EventHandlers.insertFiles(Images, {
    metadata: function (fileObj) {
      console.log('metadataaaaa');
      return {
        //owner: Meteor.userId(),
        //foo: "bar",
        dropped: dropped
      };
    },
    after: function (error, fileObj) {
      console.log('afterrrrrr');
      if (!error) {
        console.log("Inserted", fileObj.name());
      }
    }
  });
}

// Can't call getHandler until startup so that Collections object is available
Meteor.startup(function () {
  Template.createAd.events({
    'dropped .imageArea': getHandler(true),
    'dropped .imageDropArea': getHandler(true),
    'change input.images': getHandler(false)
  });
});

Template.createAd.helpers({
  uploadedImages: function() {
    return Images.find();
  }
});
