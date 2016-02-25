import {Images} from '/server/collections.js';


function trueFunc(userId) {
  if (!userId) {
    // must be logged in
    return false;
  }

  return true;
}

function falseFunc() {
  return false;
}

Images.allow({
  insert: trueFunc,
  update: trueFunc,
  remove: trueFunc,
  download: trueFunc
});

Images.deny({
  insert: falseFunc,
  update: falseFunc,
  remove: falseFunc,
  download: falseFunc
});
