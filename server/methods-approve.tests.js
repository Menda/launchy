'use strict';
import expect from 'expect';
import {Roles} from 'meteor/alanning:roles';
import {Meteor} from 'meteor/meteor';
import {assert} from 'meteor/practicalmeteor:chai';
import {stubs} from 'meteor/practicalmeteor:sinon';

import {Cars} from '/collections/collections.js';
import {} from '/server/methods.js';
import {cleanData, insertCar, createUser, createAdminUser, createEmployeeUser}
       from '/server/test-fixtures.js';


describe('Meteor.methods.approveAdminAd', () => {
  before((done) => {
    cleanData();
    insertCar();
    done();
  });

  it('should reject approval from anonymous user', () => {
    expect(() => {
      Meteor.call('approveAdminAd', 'carId');
    }).toThrow('403');
  });

  it('should reject approval from user', () => {
    expect(() => {
      Meteor.runAsUser('user', () => {
        Meteor.call('approveAdminAd', 'carId');
      });
    }).toThrow('403');
  });

  it('should accept approval from worker', () => {
    let car = Cars.findOne('carId');
    assert.isFalse(car.published);

    stubs.create('rolesUserIsInRole', Roles, 'userIsInRole');
    stubs.rolesUserIsInRole.returns(true);

    Meteor.runAsUser('employee', () => {
      Meteor.call('approveAdminAd', 'carId');
    });

    car = Cars.findOne('carId');
    assert.isTrue(car.published);

    stubs.restoreAll();
  });
});

describe('Meteor.methods.rejectAdminAd', () => {
  before((done) => {
    cleanData();
    insertCar();
    done();
  });

  it('should reject rejection from anonymous user', () => {
    expect(() => {
      Meteor.call('rejectAdminAd', 'carId');
    }).toThrow('403');
  });

  it('should reject rejection from user', () => {
    expect(() => {
      Meteor.runAsUser('user', () => {
        Meteor.call('rejectAdminAd', 'carId');
      });
    }).toThrow('403');
  });

  it('should accept rejection from worker', () => {
    let car = Cars.findOne('carId');
    assert.isTrue(car.active);

    stubs.create('rolesUserIsInRole', Roles, 'userIsInRole');
    stubs.rolesUserIsInRole.returns(true);

    Meteor.runAsUser('employee', () => {
      Meteor.call('rejectAdminAd', 'carId');
    });

    car = Cars.findOne('carId');
    assert.isFalse(car.active);

    stubs.restoreAll();
  });
});
