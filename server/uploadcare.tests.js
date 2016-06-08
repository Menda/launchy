'use strict';
import {Meteor} from 'meteor/meteor';
import {assert} from 'meteor/practicalmeteor:chai';

import {Uploadcare} from '/server/uploadcare.js';


describe('Uploadcare', () => {
  it('getRequestOptions', () => {
    const publicKey = Meteor.settings.public.uploadcare.public_key;
    const secretKey = Meteor.settings.private.uploadcare.secret_key;

    const uploadcare = new Uploadcare();
    const res = uploadcare._getRequestOptions();
    assert.equal(res['headers']['Accept'], 'application/vnd.uploadcare-v0.5+json');
    assert.equal(res['headers']['Authorization'], `Uploadcare.Simple ${publicKey}:${secretKey}`);
  });


  it('getGroupId should return the Id', () => {
    const res = Uploadcare.getGroupId(
      'https://ucarecdn.com/b168a321-447e-4b88-83cf-c731fe5f40c2~2/');
    assert.equal(res, 'b168a321-447e-4b88-83cf-c731fe5f40c2~2');
  });
});
