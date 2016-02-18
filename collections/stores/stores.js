Stores = {};

if (Meteor.settings.public.environment === 'development'|'staging') {
  /**
   * TODO: uncomment this and delete S3 when developing.
   *
  Stores.images = new FS.Store.GridFS('images');
  Stores.thumbs = new FS.Store.GridFS('thumbs', {
    transformWrite: function(fileObj, readStream, writeStream) {
      // Transform the image into a 60px x 60px PNG thumbnail
      gm(readStream).resize(200).stream('JPG').pipe(writeStream);
      // The new file size will be automatically detected and set for this store
    }
  });
  */

  if (Meteor.isServer) {
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

  // We don't want the client to access the secret data
  if (Meteor.isClient) {
    Stores.images = new FS.Store.S3("images");
    Stores.thumbs = new FS.Store.S3("thumbs");
  }

} else {
  if (Meteor.isServer) {
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

  // We don't want the client to access the secret data
  if (Meteor.isClient) {
    Stores.images = new FS.Store.S3("images");
    Stores.thumbs = new FS.Store.S3("thumbs");
  }
}
