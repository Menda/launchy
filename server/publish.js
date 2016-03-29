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

// Only return to the view cars which are published or the owner or the admin
// or employee are logged in. Then of course, this is refiltered again inside
// the view in order to have a smaller scope and not showing everything.
Meteor.publish('cars', function() {
  const userId = this.userId;
  // Fields allowed to be read on the client, don't send private data
  const fields = {
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
    'published': 1,
    'active': 1
  }
  if (! userId) {
    return Cars.find({published: true}, {fields: fields});
  } else {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    const isEmployee = Roles.userIsInRole(userId, 'employee');
    if (isAdmin || isEmployee) {
      return Cars.find({}, {fields: fields});
    } else {
      return Cars.find({
        $or: [
          {userId: userId},
          {published: true}
        ]
      }, {fields: fields});
    }
  }
});

Meteor.publish('images', () => {
  return Images.find();
});
