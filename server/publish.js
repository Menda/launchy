'use strict';
import {Meteor} from 'meteor/meteor';

import {Makes, Districts, Cars} from '/collections/collections.js';
import {Images} from '/server/collections.js';


Meteor.publish('districts', () => {
  return Districts.find();
});

Meteor.publish('makes', () => {
  return Makes.find();
});

// Only show cars which are published or the owner or the admin
// or employee are logged in.
Meteor.publish('cars', function() {
  const userId = this.userId;
  if (! userId) {
    return Cars.find({published: true});
  } else {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    const isEmployee = Roles.userIsInRole(userId, 'employee');
    if (isAdmin || isEmployee) {
      return Cars.find({});
    } else {
      return Cars.find({
        $or: [
          {userId: userId},
          {published: true}
        ]
      });
    }
  }
});

Meteor.publish('images', () => {
  return Images.find();
});
