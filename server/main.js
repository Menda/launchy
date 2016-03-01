'use strict';
import {FS} from 'meteor/cfs:base-package';
import {Meteor} from 'meteor/meteor';


function checkEnvVars() {
  console.log('Checking environment variables...');
  if (! Meteor.settings.public.environment) {
    throw new Error('--settings are missing');
  }
  console.log('All OK!');
}

/**
 * Image upload and handling settings.
 */
function setFSSettings() {
  if (Meteor.settings.public.environment === 'development'|'staging') {
    FS.debug = true; // enable CFS debug logging
  }

  // default GET request headers
  FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
  ]);
}

Meteor.startup(() => {
  checkEnvVars();
  setFSSettings();
  console.log(`You are running environment: ${Meteor.settings.public.environment}`);
});
