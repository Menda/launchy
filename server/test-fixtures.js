'use strict';
import {Accounts} from 'meteor/accounts-base';
import {Roles} from 'meteor/alanning:roles';
import {Meteor} from 'meteor/meteor';

import {Districts, Makes, Cars, Blogposts} from '/collections/collections.js';
import {Images} from '/server/collections.js';


export function cleanData() {
  Makes.remove({});
  Districts.remove({});
  Cars.remove({});
  Blogposts.remove({});
  Images.remove({});
}

export function insertCar() {
  // Make details
  const makeObj = {'_id': 'makeId', 'name': 'BMW', '_value': 'xxx'};
  const insertSyncMakes = Meteor.wrapAsync(Makes.insert, Makes);
  insertSyncMakes(makeObj);

  // District details
  const districtObj = {country: 'España', region: 'País Vasco', district: 'Vizcaya'};

  // Contact details
  const contactObj = {email: 'fake@email.com', phone: '666777888', fullname: 'Pepe Marcha'}

  // Car details
  const carObj = {
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
}
