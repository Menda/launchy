'use strict';
import {Roles} from 'meteor/alanning:roles';
import {Meteor} from 'meteor/meteor';
import {assert} from 'meteor/practicalmeteor:chai';
import {stubs, spies} from 'meteor/practicalmeteor:sinon';
import {_} from 'meteor/underscore';
import sinon from 'sinon';

import {Cars} from '/collections/collections.js';
import {Schemas} from '/collections/schemas.js';
import {EmailBuilder} from '/server/email_builder.js';
import {} from '/server/methods.js';
import {Check} from '/server/methods.js';
import {Uploadcare} from '/server/uploadcare.js';
const uploadcare = require('/server/uploadcare.js')


describe('Meteor.methods.createAd', () => {
  it('should send email with right params', () => {
    stubs.create('schemasCarClean', Schemas.Car, 'clean');
    stubs.create('checkCheck', Check, 'check');
    stubs.create('carsInsert', Cars, 'insert');
    stubs.carsInsert.returns('01234');

    const uploadImagesToS3 = sinon.stub(Uploadcare.prototype, 'uploadImagesToS3');
    uploadImagesToS3.returns([{
      image: {
        uuid: '<UUID>',
        url: 'http://image.com/img.jpg',
        size: {
          height: 960,
          width: 1280
        }
      },
      thumb: {
        uuid: '<UUID>',
        url: 'http://image.com/thumb.jpg',
        size: {
          height: 300,
          width: 400
        }
      }
    }]);
    stubs.create('rolesGetUsersInRole', Roles, 'getUsersInRole');
    const obj = {
      fetch() {
        return [
          {'emails': [{address: '<FAKE1>'}]},
          {'emails': [{address: '<FAKE2>'}]}
        ]
      }
    }
    stubs.rolesGetUsersInRole.returns(obj);
    spies.create('adminNewAd', EmailBuilder, 'adminNewAd');
    stubs.create('meteorDefer', Meteor, 'defer');

    const doc = {
      'uploadcareGroupUrl': 'https://ucarecdn.com/ffd6e227-5be6-4330-96cb-f44f5b7df342/',
      'make': 'Cadillac',
      'title': 'Escalade ESV'
    };
    Meteor.apply('createAd', [doc]);

    // I cannot really test Email.send() to see its values because it's wrapped
    // by Meteor.defer() to be asynchronous, and I don't find a way to make it
    // behave to be synchronous, not even with wrapAsync.
    assert.equal(stubs.meteorDefer.callCount, 2);

    const expectedArgs = {
      from: Meteor.settings.private.emails.from,
      to: '<FAKE1>',
      subject: 'Nuevo anuncio: Cadillac Escalade ESV',
      text: 'ID: 01234'
    };
    const result1st = spies.adminNewAd.returnValues[0];
    assert.isTrue(_.isEqual(result1st, expectedArgs))

    expectedArgs.to = '<FAKE2>';
    const result2nd = spies.adminNewAd.returnValues[1];
    assert.isTrue(_.isEqual(result2nd, expectedArgs))

    spies.restoreAll();
    stubs.restoreAll();
  });
});
