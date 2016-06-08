'use strict';
import {Meteor} from 'meteor/meteor';


function checkEnvVars() {
  console.log('Checking environment variables');
  if (! Meteor.settings.public.environment) {
    throw new Error('--settings are missing');
  }
}

function setEmailSettings() {
  if (Meteor.settings.private.emails.username && Meteor.settings.private.emails.password) {
    console.log('Setting email config');
    const smtp = {
      username: Meteor.settings.private.emails.username,
      password: Meteor.settings.private.emails.password,
      server: Meteor.settings.private.emails.servername,
      port: Meteor.settings.private.emails.serverport
    };
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
  }
}

Meteor.startup(() => {
  checkEnvVars();
  setEmailSettings();
  console.log(`You are running environment: ${Meteor.settings.public.environment}`);
});
