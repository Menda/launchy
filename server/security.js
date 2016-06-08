/**
 * Here we define for each action related a certain collection, which actions
 * are allowed from the client code to be executed. This does not apply to
 * Meteor.methods actions, as those are executed server-side.
 */
'use strict';
import {Meteor} from 'meteor/meteor';
import {Districts, Makes, Cars, Blogposts} from '/collections/collections.js';


Meteor.users.deny({
  update: function() {
    return true;
  }
});

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
