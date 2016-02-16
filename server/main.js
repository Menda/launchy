var checkEnvVars = function() {
  console.log('Checking environment variables...');
  if (! Meteor.settings.public.environment) {
    throw new Error('--settings are missing');
  }
  console.log('All OK!');
}

var setFSSettings = function() {
  if (Meteor.settings.public.environment === 'development'|'staging') {
    FS.debug = true; // enable CFS debug logging
  }

  // default GET request headers
  FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
  ]);

  // GET request headers for the "any" store
  FS.HTTP.setHeadersForGet([
    ['foo', 'bar']
  ], 'any');
}

Meteor.startup(function () {
  checkEnvVars();
  setFSSettings();
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
