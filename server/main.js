'use strict';
import {FS} from 'meteor/cfs:base-package';
import {Meteor} from 'meteor/meteor';


function checkEnvVars() {
  console.log('Checking environment variables');
  if (! Meteor.settings.public.environment) {
    throw new Error('--settings are missing');
  }
}

/**
 * Image upload and handling settings.
 */
function setFSSettings() {
  console.log('Setting image upload and handling config');
  if (Meteor.settings.public.environment === 'development'|'staging') {
    FS.debug = false;
  }

  // default GET request headers
  FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
  ]);
}

function setEmailSettings() {
  if (Meteor.settings.private.emails.username && Meteor.settings.private.emails.password) {
    console.log('Setting email config');
    const smtp = {
      username: Meteor.settings.private.emails.username,
      password: Meteor.settings.private.emails.password,
      server: 'smtp.gmail.com',
      port: 25
    };
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
  }
}

Meteor.startup(() => {
  checkEnvVars();
  setFSSettings();
  setEmailSettings();
  console.log(`You are running environment: ${Meteor.settings.public.environment}`);
});
