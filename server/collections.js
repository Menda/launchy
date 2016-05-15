'use strict';
import {Stores} from '/server/stores.js';
import {FS} from 'meteor/cfs:base-package';


// Needs to be duplicated here and also in client because we need to
// have duplicated stores for client and server, as the client cannot see our
// credentials for S3.
export const Images = new FS.Collection('images', {
  stores: [
    Stores.images,
    Stores.thumbs_retina,
    Stores.thumbs
  ],
  filter: {
    maxSize: 10 * 1024 * 1024, // in bytes
    allow: {
      contentTypes: ['image/jpeg', 'image/png']
    }
  }
});
