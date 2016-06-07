'use strict';
import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {Makes, Districts, Cars, Blogposts} from '/collections/collections.js';
import {Images} from '/server/collections.js';


Meteor.publish('districts', () => {
  return Districts.find();
});

Meteor.publish('makes', () => {
  return Makes.find();
});

// Car fields allowed to be sent on the client, don't send private data!
const carFields = {
  '_id': 1,
  'make': 1,
  'title': 1,
  'district': 1,
  'price': 1,
  'fuel': 1,
  'transmission': 1,
  'year': 1,
  'kilometers': 1,
  'description': 1,
  'images': 1,
  'color': 1,
  'doors': 1,
  'body': 1,
  'horsepower': 1,
  'wheelDrive': 1,
  'owners': 1,
  'maintenance': 1,
  'warranty': 1,
  'createdAt': 1
};

const carDetailsFields = _.extend(carFields, {
  'published': 1,
  'active': 1
});

const carSoldFields = {
  '_id': 1,
  'make': 1,
  'title': 1,
  'year': 1,
  'kilometers': 1,
  'published': 1,
  'active': 1,
  'updatedAt': 1
};

const editAdCarFields = _.extend(carDetailsFields, {
  'contact': 1
});

/**
 * Only publishes cars which are published and approved
 */
Meteor.publish('lastAddedCars', (limit) => {
  return Cars.find({published: true, active: true},
                   {fields: carFields, sort: {createdAt: -1}, limit: limit});
});

/**
 * Only publishes cars which are already sold
 */
Meteor.publish('lastClosedCars', (limit) => {
  return Cars.find({published: true, active: false},
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
      return Cars.find({
        _id: carId,
        userId: userId
      }, {fields: fields});
    }
  }
});

Meteor.publish('images', () => {
  return Images.find({});
});

Meteor.publish('assignedImages', () => {
  return Images.find({assigned: {
      $not : { $type : 10 },
      $exists : true
    }
  });
});

Meteor.publish('justUploadedImages', () => {
  const dateNow = new Date();
  return Images.find({assigned: false, uploadedAt: {$gte: dateNow}});
});

Meteor.publish('imagesDetail', (carId) => {
  return Images.find({assigned: carId});
});
