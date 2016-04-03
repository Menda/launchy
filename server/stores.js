'use strict';
import {FS} from 'meteor/cfs:base-package';
import {gm} from 'meteor/cfs:graphicsmagick';
import {Meteor} from 'meteor/meteor';


export const Stores = {};

// Use S3 if settings have the credentials
if (Meteor.settings.private.AWS) {
  Stores.images = new FS.Store.S3('images', {
    region: 'eu-west-1',
    accessKeyId: Meteor.settings.private.AWS.accessKeyId,
    secretAccessKey: Meteor.settings.private.AWS.secretAccessKey,
    bucket: Meteor.settings.private.AWS.bucket
  });

  Stores.thumbs_retina = new FS.Store.S3('thumbs-retina', {
    region: 'eu-west-1',
    accessKeyId: Meteor.settings.private.AWS.accessKeyId,
    secretAccessKey: Meteor.settings.private.AWS.secretAccessKey,
    bucket: Meteor.settings.private.AWS.bucket + '-thumbs',
    folder: 'retina',
    transformWrite(fileObj, readStream, writeStream) {
      gm(readStream).resize(400).stream('JPG').pipe(writeStream);
    }
  });

  Stores.thumbs = new FS.Store.S3('thumbs', {
    region: 'eu-west-1',
    accessKeyId: Meteor.settings.private.AWS.accessKeyId,
    secretAccessKey: Meteor.settings.private.AWS.secretAccessKey,
    bucket: Meteor.settings.private.AWS.bucket + '-thumbs',

    transformWrite(fileObj, readStream, writeStream) {
      // Transform the image into little thumbnail
      gm(readStream).resize(200).stream('JPG').pipe(writeStream);
    }
  });
// Otherwise use GridFS on development/staging
} else {
  Stores.images = new FS.Store.GridFS('images');
  Stores.thumbs_retina = new FS.Store.GridFS('thumbs-retina', {
    transformWrite(fileObj, readStream, writeStream) {
      gm(readStream).resize(400).stream('JPG').pipe(writeStream);
    }
  });
  Stores.thumbs = new FS.Store.GridFS('thumbs', {
    transformWrite(fileObj, readStream, writeStream) {
      gm(readStream).resize(200).stream('JPG').pipe(writeStream);
    }
  });
}
