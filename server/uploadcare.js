'use strict';
const fs = require('fs');
const request = require('request');

import {HTTP} from 'meteor/http';
import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {getResizeDimensions} from '/lib/utils.js';
import {Check} from '/server/methods.js';

const UPLOADCARE_DOMAIN = 'https://api.uploadcare.com';
const UPLOADCARE_CDN = 'https://ucarecdn.com';
const UPLOADCARE_UPLOAD = 'https://upload.uploadcare.com';


export class Uploadcare {
  constructor() {
    this._publicKey = Meteor.settings.public.uploadcare.public_key;
    this._secretKey = Meteor.settings.private.uploadcare.secret_key;
    this._target = Meteor.settings.private.uploadcare.storage;
  }

  _getRequestOptions() {
    return {
      headers: {
        Accept: 'application/vnd.uploadcare-v0.5+json',
        Date: new Date().toJSON(),
        Authorization: `Uploadcare.Simple ${this._publicKey}:${this._secretKey}`
      }
    }
  }

  getFilesList(groupId) {
    const url = `${UPLOADCARE_DOMAIN}/groups/${groupId}/`;
    let result;
    try {
      result = HTTP.call('GET', url, this._getRequestOptions());
    } catch (e) {
      console.log(e);
      return false;
    }

    const content = JSON.parse(result.content);
    return content.files;
  }

  uploadFileSync(filepath, wait) {
    console.log(`Uploading file ${filepath}`);
    const uploadUrl = `${UPLOADCARE_UPLOAD}/base/`;
    var formData = {
      UPLOADCARE_PUB_KEY: this._publicKey,
      UPLOADCARE_STORE: 0,
      file: fs.createReadStream(filepath)
    };

    const res = Meteor.wrapAsync(request.post)({url: uploadUrl, formData: formData});
    if (wait) {
      Meteor._sleepForMs(wait);
    }
    return res;
  }

  uploadFile(filepath, callback) {
    console.log(`Uploading file ${filepath}`);
    const uploadUrl = `${UPLOADCARE_UPLOAD}/base/`;
    var formData = {
      UPLOADCARE_PUB_KEY: this._publicKey,
      UPLOADCARE_STORE: 0,
      file: fs.createReadStream(filepath)
    };
    request.post({url: uploadUrl, formData: formData}, callback);
  }

  /**
   * Upload file to Uploadcare servers. This doesn't upload file to S3 storage.
   */
  uploadFileFromUrl(url) {
    console.log(`Uploading file ${url}`);
    const uploadUrl = `${UPLOADCARE_UPLOAD}/from_url/?pub_key=${this._publicKey}` +
                      `&store=0&source_url=${url}`;

    var result = HTTP.call('GET', uploadUrl);
    const token = result.data.token

    Meteor._sleepForMs(5000);

    const statusUrl = `${UPLOADCARE_UPLOAD}/from_url/status/` +
                      `?token=${token}`;
    result = HTTP.call('GET', statusUrl);
    const content = JSON.parse(result.content);
    return content;
  }

  /**
   * Saves synchronously an image.
   */
  saveImage(uuid, size) {
    console.log(`Saving image ${uuid} with size ${size}`);
    const postOptions = _.extend(this._getRequestOptions(), {
      data: {
        source: `${UPLOADCARE_CDN}/${uuid}/-/preview/${size}/-/progressive/yes/`,
        target: this._target
      }
    });
    try {
      return HTTP.call('POST', `${UPLOADCARE_DOMAIN}/files/`, postOptions);
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  /**
   * Removes asynchronously a file.
   */
  removeFile(uuid) {
    console.log(`Deleting from Uploadcare file ${uuid}`);
    const deleteUrl = `${UPLOADCARE_DOMAIN}/files/${uuid}/storage/`;
    HTTP.call('DELETE', deleteUrl, this._getRequestOptions(), function(err, res) {
      if (err) {
        console.log(err);
      }
    });
  }

  /**
   * Copies images to Amazon S3 and returns an array of links to them.
   */
  uploadImagesToS3(groupId) {
    Check.check(groupId, String);

    // Get a list of files first
    const files = this.getFilesList(groupId);

    const images = [];
    _.each(files, (file) => {
      // Save image
      const [measuredImgSize, measuredImgWidth, measuredImgHeight] =
        Uploadcare.getImageSize(
          file.uuid, file.image_info.width, file.image_info.height,
          Meteor.settings.private.uploadcare.size_img);
      const imageResult = this.saveImage(file.uuid, measuredImgSize);

      // Save thumbnail
      const [measuredThumbSize, measuredThumbWidth, measuredThumbHeight] =
        Uploadcare.getImageSize(
          file.uuid, file.image_info.width, file.image_info.height,
          Meteor.settings.private.uploadcare.size_thumb);
      const thumbResult = this.saveImage(file.uuid, measuredThumbSize);

      images.push({
        image: {
          uuid: file.uuid,
          url: imageResult.headers.location.replace('http:', ''),
          size: {
            height: measuredImgHeight,
            width: measuredImgWidth
          }
        },
        thumb: {
          uuid: file.uuid,
          url: thumbResult.headers.location.replace('http:', ''),
          size: {
            width: measuredThumbWidth,
            height: measuredThumbHeight
          }
        }
      });

      this.removeFile(file.uuid);
    });

    return images;
  }

  static getImageSize(uuid, width, height, maxSize) {
    const maxWidth = maxSize.split("x")[0],
          maxHeight = maxSize.split("x")[1];
    const [measuredWidth, measuredHeight] = getResizeDimensions(
      width, height, maxWidth, maxHeight);
    const measuredSize = `${measuredWidth}x${measuredHeight}`;
    return [measuredSize, measuredWidth, measuredHeight];
  }

  static getGroupId(url) {
    const partUrl = url.split('ucarecdn.com/')[1];
    return partUrl.slice(0, partUrl.lastIndexOf('/'));
  }
}
