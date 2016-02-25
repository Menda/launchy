'use strict';
import {Images} from '/server/collections.js';


Meteor.publish("images", () => {
  return Images.find();
});
