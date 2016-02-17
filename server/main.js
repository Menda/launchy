var checkEnvVars = function() {
  console.log('Checking environment variables...');
  if (! Meteor.settings.public.environment) {
    throw new Error('--settings are missing');
  }
  console.log('All OK!');
}

/**
 * Image upload and handling settings.
 */
var setFSSettings = function() {
  if (Meteor.settings.public.environment === 'development'|'staging') {
    FS.debug = true; // enable CFS debug logging
  }

  // default GET request headers
  FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
  ]);
}

Meteor.startup(function () {
  checkEnvVars();
  setFSSettings();
  console.log('You are running environment: ' + Meteor.settings.public.environment);
});

Meteor.methods({
  createAd: function(doc) {
    var session = doc.session;

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
    var id = Cars.insert(doc);

    Images.update({session: session}, {
      $set: {assigned: id}}, {multi: true});
  }
});
