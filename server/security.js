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
      return false;
    }
    return true;
  },
  download: () => true,
});
