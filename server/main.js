var checkEnvVars = function() {
  console.log('Checking environment variables...');
  if (! Meteor.settings.public.environment) {
    throw new Error('--settings are missing');
  }
  console.log('All OK!');
}

Meteor.startup(function () {
  checkEnvVars();
  console.log('You are running environment: ' + Meteor.settings.public.environment);
});

Meteor.methods({
  createAd: function(doc) {
    // Delete values which are not in the schema and fill autovalues
    delete doc['districtId'];
    Schemas.Car.clean(doc, {
      extendAutoValueContext: {
        isInsert: true,
        isUpdate: false,
        isUpsert: false,
        isFromTrustedCode: false
      }
    });

    // Important server-side check for security and data integrity
    check(doc, Schemas.Car);

    Cars.insert(doc);
  }
});
