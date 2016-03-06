'use strict';
import expect from 'expect';
import {Meteor} from 'meteor/meteor';
import {assert} from 'meteor/practicalmeteor:chai';

import {Districts, Makes, Cars} from '/collections/collections.js';
import {} from '/server/methods.js';


describe('Meteor.methods.assignAccountAd', () => {
  beforeEach(() => {
    Makes.remove({});
    Districts.remove({});
    Cars.remove({});

    // Insert a make
    const makeObj = {'_id': 'makeId', 'name': 'BMW', '_value': 'xxx'};
    const insertSyncMakes = Meteor.wrapAsync(Makes.insert, Makes);
    insertSyncMakes(makeObj);
    Makes.findOne({name: makeObj['name']})['_id'];

    // Insert a car
    var districtObj = {country: 'España', region: 'País Vasco', district: 'Vizcaya'};
    const contactObj = {email: 'fake@email.com', phone: '666777888', fullname: 'Pepe Marcha'}
    var carObj = {
      _id: 'carId',
      makeId: 'makeId',
      title: 'BMW 7 Series F01 730d SE N57 3.0d',
      price: 34000,
      color: 'Pure Metal Silver',
      fuel: 'diesel',
      transmission: 'automatic',
      doors: 4,
      body: 'sedan',
      horsepower: 256,
      year: 2015,
      kilometers: 120000,
      description: 'Luxury and comfort like never experienced.',
      district: districtObj,
      warranty: '2 years with unlimited kilometers',
      contact: contactObj
    };
    const insertSyncCars = Meteor.wrapAsync(Cars.insert, Cars);
    insertSyncCars(carObj);
  });

  it('should reject invalid params are passed', () => {
    expect(() => {
      Meteor.call('assignAccountAd');
    }).toThrow('403');

    expect(() => {
      Meteor.apply('assignAccountAd', ['<USER_ID>', null]);
    }).toThrow('403');

    expect(() => {
      Meteor.apply('assignAccountAd', [null, '<CAR_ID>']);
    }).toThrow('403');
  });

  it('should deny when carId is not found', () => {
    expect(() => {
      Meteor.apply('assignAccountAd', ['<USER_ID>', '<FAKE>']);
    }).toThrow('403');
  });

  it('should deny when user is assigned already', () => {
    const updateSync = Meteor.wrapAsync(Cars.update, Cars);
    updateSync({_id: 'carId'}, {$set: {userId: '<USER_ID>'}});

    expect(() => {
      Meteor.apply('assignAccountAd', ['<USER_ID>', 'carId']);
    }).toThrow('403');
  });

  it('should go fine when no user was assigned', () => {
    Meteor.apply('assignAccountAd', ['<USER_ID>', 'carId']);
    const car = Cars.findOne({_id: 'carId'});
    assert.equal(car.userId, '<USER_ID>');
  });
});
