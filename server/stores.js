export const Stores = {};

// Use GridFS on development/staging
if (Meteor.settings.public.environment === 'development'|'staging') {
  Stores.images = new FS.Store.GridFS('images');
  Stores.thumbs = new FS.Store.GridFS('thumbs', {
    transformWrite: function(fileObj, readStream, writeStream) {
      // Transform the image into a 60px x 60px PNG thumbnail
      gm(readStream).resize(200).stream('JPG').pipe(writeStream);
      // The new file size will be automatically detected and set for this store
    }
  });

// Use S3 on production
} else {
  Stores.images = new FS.Store.S3('images', {
    region: "eu-west-1",
    accessKeyId: Meteor.settings.private.AWSAccessKeyId,
    secretAccessKey: Meteor.settings.private.AWSSecretAccessKey,
    bucket: Meteor.settings.private.AWSBucket
  });

  Stores.thumbs = new FS.Store.S3('thumbs', {
    region: "eu-west-1",
    accessKeyId: Meteor.settings.private.AWSAccessKeyId,
    secretAccessKey: Meteor.settings.private.AWSSecretAccessKey,
    bucket: Meteor.settings.private.AWSBucket + '-thumbs',

    transformWrite: function(fileObj, readStream, writeStream) {
      // Transform the image into little thumbnail
      gm(readStream).resize(200).stream('JPG').pipe(writeStream);
    }
  });
}
