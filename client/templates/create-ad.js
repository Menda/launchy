Template.createAd.helpers({
  makeOptions: function () {
    var options = [];
    var makes = Makes.find();
    makes.forEach(function(make){
      options.push({
        'label': make['name'],
        'value': make['_id'],
        'data-allowed': make['allowed']
      });
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
});

Template.createAd.events({
  'change #form-make': function (evt) {
    var allowed = $(evt.target).find(':selected').data('allowed');
    if (allowed == false) {
      console.log('Disable form and display error');
    }
  }
});
