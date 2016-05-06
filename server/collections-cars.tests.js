'use strict';
import expect from 'expect';
import {Meteor} from 'meteor/meteor';
import {assert} from 'meteor/practicalmeteor:chai';

import {Districts, Makes, Cars} from '/collections/collections.js';
import {cleanData} from '/server/test-fixtures.js';


describe('Car', () => {
  // Prepare data
  var makeId; // will be filled in before each iteration
  const districtObj = {country: 'España', region: 'País Vasco', district: 'Vizcaya'};
  const contactObj = {email: 'fake@email.com', phone: '666777888', fullname: 'Pepe Marcha'}
  var carObj = {
    makeId: '',
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

  beforeEach(() => {
    cleanData();

    const makeObj = {'name': 'BMW', '_value': 'xxx'};
    const insertSync = Meteor.wrapAsync(Makes.insert, Makes);
    insertSync(makeObj);
    makeId = Makes.findOne({name: makeObj['name']})['_id'];
  });

  it('should be inserted successfuly', () => {
    carObj['makeId'] = makeId;
    const insertSync = Meteor.wrapAsync(Cars.insert, Cars);
    const result = insertSync(carObj);
    assert.typeOf(result, 'string');
  });

  it('should be inserted successfuly with populated make', () => {
    carObj['makeId'] = makeId;
    const insertSync = Meteor.wrapAsync(Cars.insert, Cars);
    const carID = insertSync(carObj);
    const result = Cars.findOne(carID).make;
    assert.equal(result, 'BMW');
  });

  it('should be inserted successfuly without being published', () => {
    carObj['makeId'] = makeId;
    const insertSync = Meteor.wrapAsync(Cars.insert, Cars);
    const carID = insertSync(carObj);
    const result = Cars.findOne(carID).published;
    assert.notOk(result);
  });

  it('should be inserted successfuly with good creation date', () => {
    carObj['makeId'] = makeId;
    const insertSync = Meteor.wrapAsync(Cars.insert, Cars);
    const carID = insertSync(carObj);
    const result = Cars.findOne(carID).createdAt;
    assert.typeOf(result, 'date');
    const dateNow = new Date();
    assert.isBelow(result, dateNow);
  });

  it('should be updated successfuly with good updated date', () => {
    carObj['makeId'] = makeId;
    const insertSync = Meteor.wrapAsync(Cars.insert, Cars);
    const carID = insertSync(carObj);
    const updateSync = Meteor.wrapAsync(Cars.update, Cars);
    updateSync({_id: carID}, {$set: {year: 2010}});
    const result = Cars.findOne(carID);
    assert.typeOf(result.updatedAt, 'date');
    const dateNow = new Date();
    assert.isBelow(result.updatedAt, dateNow);
    assert.notEqual(result.updatedAt, result.createdAt);
  });

  it('should be inserted successfuly without warranty', () => {
    carObj['makeId'] = makeId;
    const modCarObj = JSON.parse(JSON.stringify(carObj));
    delete modCarObj.warranty;
    const insertSync = Meteor.wrapAsync(Cars.insert, Cars);
    const result = insertSync(modCarObj);
    assert.typeOf(result, 'string');
  });

  it('should be not inserted successfuly on wrong date', () => {
    carObj['makeId'] = makeId;
    const modCarObj = JSON.parse(JSON.stringify(carObj));
    modCarObj['year'] = 1899;
    let errored;
    const insertSync = Meteor.wrapAsync(Cars.insert, Cars);
    try {
      insertSync(modCarObj);
      errored = false;
    } catch(error) {
      errored = true;
    }
    assert.isTrue(errored, 'insert failed raising an exception');
  });
});
