'use strict';
import expect from 'expect';
import {Meteor} from 'meteor/meteor';
import {chai, assert} from 'meteor/practicalmeteor:chai';

import {Makes} from '/collections/collections.js';


describe('Make', () => {
  beforeEach(() => {
    Makes.remove({});
  });

  it('should be inserted successfuly', () => {
    const insertSync = Meteor.wrapAsync(Makes.insert, Makes);
    const result =  insertSync({name: 'Ferrari', description: 'Sportive!', '_value': 'xxx'});
    assert.typeOf(result, 'string', 'insert method return a string on success');
  });

  it('should be inserted successfuly without optional', () => {
    const insertSync = Meteor.wrapAsync(Makes.insert, Makes);
    const result =  insertSync({name: 'Ferrari', description: null, '_value': 'xxx'});
    assert.typeOf(result, 'string', 'insert method return a string on success');
  });

  it('should validate successfuly with null optional', () => {
    const obj = {name: 'Ferrari', description: null, '_value': 'xxx'};
    const succeeded = Makes.simpleSchema().namedContext().validate(obj);
    assert.isTrue(succeeded);
  });

  it('should validate successfuly without optional', () => {
    const obj = {name: 'Ferrari', '_value': 'xxx'};
    const succeeded = Makes.simpleSchema().namedContext().validate(obj);
    assert.isTrue(succeeded);
  });

  it('should not validate successfuly', () => {
    const obj = {name: 'Ferrari', invented: 'made_up', '_value': 'xxx'};
    const errored = ! Makes.simpleSchema().namedContext().validate(obj);
    assert.isTrue(errored, 'insert failed raising an exception');
  });

  it('should not be inserted successfuly', () => {
    let errored;
    const insertSync = Meteor.wrapAsync(Makes.insert, Makes);
    try {
      insertSync({name: 'Ferrari', invented: 'made_up'});
      errored = false;
    } catch(error) {
      errored = true;
    }
    assert.isTrue(errored, 'insert failed raising an exception');
  });
});
