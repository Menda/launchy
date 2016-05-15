'use strict';
import {FS} from 'meteor/cfs:base-package';
import {gm} from 'meteor/cfs:graphicsmagick';
import {Meteor} from 'meteor/meteor';

import {getResizeDimensions} from '/lib/utils.js';


export const Stores = {};


function transformWrite(fileObj, readStream, writeStream, maxWidth, maxHeight) {
  // TODO doing many file uploads of not big images is making the server crash.

  // Some clever guy would say why I'm making this instead of
  // `gm().resize(maxWidth, maxHeight, '>')`. The reason is that the cfs_gridfs package is broken
  // and raises an error saying that the file doesn't exist if the image is smaller.
  // It doesn't happen however if it's bigger. This is why we need to always force a write
  // on the stream. Yeah, sucks.
  gm(readStream, fileObj.name()).size(
    {bufferStream: true},
    function(err, size) {
      if(! size) {
        return false;
      }
      const calcSize = getResizeDimensions(size.width, size.height, maxWidth, maxHeight);
      // Resize the image
      this.resize(calcSize[0], calcSize[1], '>');
      this.stream((err, stdout, stderr) => {
        stdout.pipe(writeStream);
      });
    }
  );

  // This is not ideal, but the only way to use fileObj.update is inside the
  // FS.Utility.safeCallback, so we cannot use it in the function above
  gm(readStream, fileObj.name()).size({bufferStream: true}, FS.Utility.safeCallback(
    (err, size) => {
      if (! size) {
        return false;
      }
      const calcSize = getResizeDimensions(size.width, size.height, maxWidth, maxHeight);
      fileObj.update({$set: {'metadata.width': calcSize[0], 'metadata.height': calcSize[1]}});
    }
  ));
}

// Use S3 if settings have the credentials
if (Meteor.settings.private.AWS) {
  Stores.images = new FS.Store.S3('images', {
    region: 'eu-west-1',
    accessKeyId: Meteor.settings.private.AWS.accessKeyId,
    secretAccessKey: Meteor.settings.private.AWS.secretAccessKey,
    bucket: Meteor.settings.private.AWS.bucket,
    transformWrite: (fileObj, readStream, writeStream) => {
      transformWrite(fileObj, readStream, writeStream, 1280, 960)
    }
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
  Stores.images = new FS.Store.GridFS('images', {
    transformWrite: (fileObj, readStream, writeStream) => {
      transformWrite(fileObj, readStream, writeStream, 1280, 960)
    }
  });
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
