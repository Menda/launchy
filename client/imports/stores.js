'use strict';
import {FS} from 'meteor/cfs:base-package';


export const Stores = {};

Stores.images = new FS.Store.GridFS('images');
Stores.thumbs = new FS.Store.GridFS('thumbs');
// TODO: thumbs-retina not missing?
