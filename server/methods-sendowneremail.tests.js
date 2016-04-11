'use strict';
import {Roles} from 'meteor/alanning:roles';
import {Meteor} from 'meteor/meteor';
import {assert} from 'meteor/practicalmeteor:chai';
import {stubs, spies} from 'meteor/practicalmeteor:sinon';

import {Cars} from '/collections/collections.js';
import {EmailBuilder} from '/server/email_builder.js';
import {} from '/server/methods.js';
import {Check} from '/server/methods.js';


describe('Meteor.methods.sendOwnerEmail', () => {
  it('should send contact email with right params', () => {
    stubs.create('checkCheck', Check, 'check');
    stubs.create('carsFindOne', Cars, 'findOne');
    stubs.carsFindOne.returns({
      _id: '01234',
      make: 'Maserati',
      title: 'Ghibli S Q4',
      contact: {
        'fullname': 'Gosia B',
        'email': 'gosiunia@mi.pl',
        'phone': '+49111222333'
      }
    });
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
    spies.create('contactOwner', EmailBuilder, 'contactOwner');
    stubs.create('meteorDefer', Meteor, 'defer');

    const doc = {
      'carId': '12345',
      'email': 'any@email.com',
      'name': 'Marta Sanacha',
      'message': 'This is the msg'
    };
    Meteor.apply('sendOwnerEmail', [doc]);
    assert.equal(stubs.meteorDefer.callCount, 2);

    const expectedText = `Name: Marta Sanacha\n` +
                         `Email: ${doc.email}\n` +
                         `Coche: http://localhost:3000/carDetails\n` +
                         `Dueño original: Gosia B <gosiunia@mi.pl> - +49111222333\n\n` +
                         `This is the msg`;
    const expectedArgs = {
      from: Meteor.settings.private.emails.from,
      to: '<FAKE1>',
      replyTo: 'any@email.com',
      subject: 'Contacto. Marta Sanacha - Maserati Ghibli S Q4',
      text: expectedText
    };
    const result1st = spies.contactOwner.returnValues[0];
    assert.isTrue(_.isEqual(result1st, expectedArgs))

    expectedArgs.to = '<FAKE2>';
    const result2nd = spies.contactOwner.returnValues[1];
    assert.isTrue(_.isEqual(result2nd, expectedArgs))

    spies.restoreAll();
    stubs.restoreAll();
  });
});
