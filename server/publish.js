'use strict';
import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {Makes, Districts, Cars, Blogposts} from '/collections/collections.js';


Meteor.publish('districts', () => {
  return Districts.find();
});

Meteor.publish('makes', () => {
  return Makes.find();
});

const carFields = {
  '_id': 1,
  'make': 1,
  'title': 1,
  'year': 1,
  'kilometers': 1,
  'images': 1,
  'contact.externalUrl': 1,
  'createdAt': 1,
  'published': 1,
  'active': 1
};

let carDetailsFields = _.clone(carFields);
carDetailsFields = _.extend(carDetailsFields, {
  'district': 1,
  'price': 1,
  'fuel': 1,
  'transmission': 1,
  'description': 1,
  'color': 1,
  'doors': 1,
  'body': 1,
  'horsepower': 1,
  'wheelDrive': 1,
  'owners': 1,
  'maintenance': 1,
  'warranty': 1
});

const carSoldFields = {
  '_id': 1,
  'make': 1,
  'title': 1,
  'year': 1,
  'kilometers': 1,
  'images': 1,
  'published': 1,
  'active': 1,
  'updatedAt': 1
};

let editAdCarFields = _.clone(carDetailsFields);
editAdCarFields = _.extend(editAdCarFields, {
  'contact.email': 1,
  'contact.phone': 1,
  'contact.fullname': 1
});

/**
 * Only publishes cars which are published and approved (non external)
 */
Meteor.publish('lastAddedCars', (limit) => {
  return Cars.find({published: true, active: true, 'contact.externalUrl': null},
                   {fields: carFields, sort: {createdAt: -1}, limit: limit});
});

/**
 * Only publishes cars which are published and approved (external)
 */
Meteor.publish('lastAddedExternalCars', (limit) => {
  return Cars.find({published: true, 'contact.externalUrl': {$ne: null}},
                   {fields: carFields, sort: {createdAt: -1}, limit: limit});
});

/**
 * Only publishes cars which are already sold
 */
Meteor.publish('lastClosedCars', (limit) => {
  return Cars.find({published: true, active: false, 'contact.externalUrl': null},
                   {fields: carSoldFields, sort: {updatedAt: -1}, limit: limit});
});

const blogpostFields = {
  'title': 1,
  'url': 1,
  'cover': 1,
  'createdAt': 1
};

/**
 * Only return to the view cars which are published and approved
 */
Meteor.publish('lastBlogposts', (limit) => {
  let limitBlogposts;
  if (! limit) {
    limitBlogposts = 6;
  } else {
    limitBlogposts = limit;
  }
  return Blogposts.find({published: true},
                   {fields: blogpostFields, sort: {createdAt: -1}, limit: limitBlogposts});
});

/**
 * Publishes car details.
 * - Approved (published=true) can be seen by everyone, even though they are not active.
 * - Still not approved (published=false) can only be seen by the owner, admins or employees.
 */
Meteor.publish('carDetails', function(carId) {
  const userId = this.userId;
  const fields = carDetailsFields;
  if (! userId) {
    return Cars.find({'_id': carId, published: true}, {fields: fields});
  }
  const isAdmin = Roles.userIsInRole(userId, 'admin');
  const isEmployee = Roles.userIsInRole(userId, 'employee');
  if (isAdmin || isEmployee) {
    return Cars.find({'_id': carId}, {fields: fields});
  } else {
    return Cars.find({
      _id: carId,
      $or: [
        {userId: userId},
        {published: true}
      ]
    }, {fields: fields});
  }
});

Meteor.publish('carDetailsEdit', function(carId) {
  const userId = this.userId;
  const fields = editAdCarFields;
  if (userId) {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    const isEmployee = Roles.userIsInRole(userId, 'employee');
    if (isAdmin || isEmployee) {
      return Cars.find({'_id': carId}, {fields: fields});
    } else {
      return Cars.find({_id: carId, userId: userId}, {fields: fields});
    }
  }
});
