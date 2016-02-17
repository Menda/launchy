Stores = {};

if (Meteor.settings.public.environment === 'development'|'staging') {

} else {

}

// var imageStore = new FS.Store.S3('images', {
//   accessKeyId: Meteor.settings.accessKeyId, //required
//   secretAccessKey: Meteor.settings.secretAccessKey, //required
//   bucket: Meteor.settings.imageStoreBucket //required
// });

// var anyStore = new FS.Store.S3('any', {
//   accessKeyId: Meteor.settings.accessKeyId, //required
//   secretAccessKey: Meteor.settings.secretAccessKey, //required
//   bucket: Meteor.settings.anyStoreBucket //required
// });

Stores.images = new FS.Store.GridFS('images');
Stores.thumbs = new FS.Store.GridFS('thumbs', {
  transformWrite: function(fileObj, readStream, writeStream) {
    // Transform the image into a 60px x 60px PNG thumbnail
    gm(readStream).resize(200).stream('JPG').pipe(writeStream);
    // The new file size will be automatically detected and set for this store
  }
});

/* TODO
if (Meteor.isServer) {
  var imageStore = new FS.Store.S3("images", {
    accessKeyId: Meteor.settings.AWSAccessKeyId, 
    secretAccessKey: Meteor.settings.AWSSecretAccessKey, 
    bucket: Meteor.settings.AWSBucket
  });

  Images = new FS.Collection("Images", {
    stores: [imageStore],
    filter: {
      allow: {
        contentTypes: ['image/*']
      }
    }
  });
}

// On the client just create a generic FS Store as don't have
// access (or want access) to S3 settings on client
if (Meteor.isClient) {
  var imageStore = new FS.Store.S3("images");
  Images = new FS.Collection("Images", {
    stores: [imageStore],
    filter: {
      allow: {
        contentTypes: ['image/*']
      },
      onInvalid: function(message) {
        toastr.error(message);
      }
    }
  });
}

// Allow rules
Images.allow({
  insert: function() { return true; },
  update: function() { return true; }
});
*/