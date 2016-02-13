if (Meteor.settings.public.environment === 'development'|'staging') {
    SimpleSchema.debug = true;
    AutoForm.debug();
}

Template.createAd.helpers({
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

AutoForm.hooks({
  createAdForm: {
    formToDoc: function(doc) {
      // Set District
      var districtId = AutoForm.getFieldValue('districtId'); // or doc['districtId']
      var district = Districts.findOne({"_id": districtId});
      delete district['_id']; // we need to delete it because it's not in the schema
      if (district) {
        doc.district = district;
      }
      return doc;
    }
  }
});
