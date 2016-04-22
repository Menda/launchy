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

const carDetailsFields = _.extend(carFields,
  {
    'published': 1,
    'active': 1
  });

/**
 * Only return to the view cars which are published and approved
 */
Meteor.publish('lastAddedCars', (limit) => {
  return Cars.find({published: true, active: true},
                   {fields: carFields, sort: {createdAt: -1}, limit: limit});
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
 * Show car details.
 * - Approved (published=true) can be seen by everyone, even though they are not active.
 * - Still not approved (published=false) can only be seen by the owner, admins or employees.
 */
Meteor.publish('carDetails', function(carId) {
  const userId = this.userId;
  if (! userId) {
    return Cars.find({'_id': carId, published: true}, {fields: carDetailsFields});
  } else {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    const isEmployee = Roles.userIsInRole(userId, 'employee');
    if (isAdmin || isEmployee) {
      return Cars.find({'_id': carId}, {fields: carDetailsFields});
    } else {
      return Cars.find({
        _id: carId,
        userId: userId,
      }, {fields: carDetailsFields});
    }
  }
});

Meteor.publish('images', () => {
  return Images.find();
});
