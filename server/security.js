// Here we define for each action related a certain collection, which actions
// are allowed from the client code to be executed. This does not apply to
// Meteor.methods actions, as those are executed server-side.
'use strict';
import {Districts, Makes, Cars, Blogposts} from '/collections/collections.js';
import {Images} from '/server/collections.js';


Districts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Makes.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Cars.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Blogposts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Images.allow({
  insert: () => true,
  update: () => true,
  remove: (userId, doc) => {
    if (! doc.assigned === false) {
      // If the image was assign to an ad and this belongs to the current user or admin,
      // then allow removal.
      if (userId) {
        const isAdmin = Roles.userIsInRole(userId, 'admin');
        const isEmployee = Roles.userIsInRole(userId, 'employee');
        if (isAdmin || isEmployee) {
          return true;
        } else {
          const car = Cars.findOne({'_id': doc.assigned});
          if (car.userId == userId) {
            return true;
          }
        }
      }
      // Otherwise, deny the removal
      return false;
    }
    return true;
  },
  download: () => true,
});
