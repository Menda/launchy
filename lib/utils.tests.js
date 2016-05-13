'use strict';
import {assert} from 'meteor/practicalmeteor:chai';
import {getResizeDimensions} from '/lib/utils.js';


describe('getResizeDimensions', () => {
  it('should give the same dimension', () => {
    const res = getResizeDimensions(1280, 960, 1280, 960)
    assert.sameMembers([1280, 960], res);
  });

  it('should not resize nothing', () => {
    const res = getResizeDimensions(1024, 768, 1280, 960)
    assert.sameMembers([1024, 768], res);
  });

  it('should resize width rounding up', () => {
    const res = getResizeDimensions(1400, 960, 1280, 960)
    assert.sameMembers([1280, 878], res);
  });

  it('should resize height rounding up', () => {
    const res = getResizeDimensions(1280, 1000, 1280, 960)
    assert.sameMembers([1229, 960], res);
  });

  it('should resize both width and height, being equally big', () => {
    const res = getResizeDimensions(1300, 1300, 1280, 960)
    assert.sameMembers([960, 960], res);
  });
  it('should resize both width and height, being greater the width', () => {
    const res = getResizeDimensions(2000, 1000, 1280, 960)
    assert.sameMembers([1280, 640], res);
  });

  it('should resize both width and height, being greater the height', () => {
    const res = getResizeDimensions(1400, 1300, 1280, 960)
    assert.sameMembers([1034, 960], res);
  });
});
