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

    console.log('Inserting ad with values: ');
    console.log(doc);
    Cars.insert(doc);
  }
});
