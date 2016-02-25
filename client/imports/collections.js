import {Stores} from '/client/imports/stores.js';


// On the client just create a generic FS Store as don't have
// access (or want access) to S3 settings on client
export const Images = new FS.Collection('images', {
  stores: [
    Stores.images,
    Stores.thumbs
  ],
  filter: {
    allow: {
      contentTypes: ['image/*']
    },
    onInvalid: function(message) {
      Meteor.isClient && alert(message);
    }
  }
});
