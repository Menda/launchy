'use strict';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {Schemas} from '/collections/schemas.js';


// The exported collections are both valid for server and client
export const Makes = new Mongo.Collection('makes');
export const Districts = new Mongo.Collection('districts');
export const Cars = new Mongo.Collection('cars');
export const Blogposts = new Mongo.Collection('blogposts');

Makes.attachSchema(Schemas.Make);
Districts.attachSchema(Schemas.District);
Cars.attachSchema(Schemas.Car);
