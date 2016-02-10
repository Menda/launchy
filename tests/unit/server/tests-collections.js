describe('@focus Make', function() {
  beforeEach(function() {
    server.execute(function() {
      Makes.remove({});
    });
  });

  it('should be inserted successfuly', function () {
      var result = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Makes.insert, Makes);
        return insertSync({name: 'Ferrari', description: 'Sportive!', '_value': 'xxx'});
      });
      assert.typeOf(result, 'string', 'insert method return a string on success');
  });

  it('should be inserted successfuly without optional', function () {
      var result = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Makes.insert, Makes);
        return insertSync({name: 'Ferrari', description: null, '_value': 'xxx'});
      });
      assert.typeOf(result, 'string', 'insert method return a string on success');
  });

  it('should validate successfuly with null optional', function () {
      var successed = server.execute(function() {
        obj = {name: 'Ferrari', description: null, '_value': 'xxx'};
        return Makes.simpleSchema().namedContext().validate(obj);
      });
      assert.isTrue(successed);
  });

  it('should validate successfuly without optional', function () {
      var successed = server.execute(function() {
        obj = {name: 'Ferrari', '_value': 'xxx'};
        return Makes.simpleSchema().namedContext().validate(obj);
      });
      assert.isTrue(successed);
  });

  it('should not validate successfuly', function () {
      var errored = server.execute(function() {
        obj = {name: 'Ferrari', invented: 'made_up', '_value': 'xxx'};
        return ! Makes.simpleSchema().namedContext().validate(obj);
      });
      assert.isTrue(errored, 'insert failed raising an exception');
  });

  // TODO: Wait for answer, possible bug:
  // https://github.com/aldeed/meteor-collection2/issues/303
  /*it('should be not inserted successfuly', function () {
      var errored = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Makes.insert, Makes);
        try {
            insertSync({name: 'Ferrari', invented: 'made_up'});
        } catch(error) {
          return true;
        }
        return false;
      });
      assert.isTrue(errored, 'insert failed raising an exception');
  });*/
});

describe('@focus District', function() {
  beforeEach(function() {
    server.execute(function() {
      Districts.remove({});
    });
  });

  it('should be inserted successfuly', function () {
      var result = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Districts.insert, Districts);
        return insertSync({country: 'España', region: 'País Vasco', district: 'Vizcaya'});
      });
      assert.typeOf(result, 'string', 'insert method return a string on success');
  });

  it('should be not inserted successfuly', function () {
      var errored = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Districts.insert, Districts);
        try {
            insertSync({country: 'España', region: 'País Vasco'});
        } catch(error) {
          return true;
        }
        return false;
      });
      assert.isTrue(errored, 'insert failed raising an exception');
  });
});

describe('@focus Car', function() {
  // Prepare data
  var makeId; // will be filled in before each iteration
  var districtObj = {country: 'España', region: 'País Vasco', district: 'Vizcaya'};
  var carObj = {
    makeId: '',
    title: 'BMW 7 Series F01 730d SE N57 3.0d',
    price: 34000,
    color: 'Pure Metal Silver',
    fuel: 'diesel',
    transmission: 'Automatic DSG',
    doors: 4,
    body: 'sedan',
    horsepower: 256,
    year: 2015,
    kilometers: 120000,
    district: districtObj,
    warranty: '2 years with unlimited kilometers',
  };

  beforeEach(function() {
    server.execute(function() {
      Makes.remove({});
      Districts.remove({});
      Cars.remove({});
    });

    makeId = server.execute(function() {
      var makeObj = {'name': 'BMW', '_value': 'xxx'};
      var insertSync = Meteor.wrapAsync(Makes.insert, Makes);
      insertSync(makeObj);
      var makeId = Makes.findOne({name: makeObj['name']})['_id'];
      return makeId;
    });
  });

  it('should be inserted successfuly', function () {
    carObj['makeId'] = makeId;
    var result = server.execute(function(carObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      return insertSync(carObj);
    }, carObj);
    assert.typeOf(result, 'string');
  });

  it('should be inserted successfuly with populated make', function () {
    carObj['makeId'] = makeId;
    var result = server.execute(function(carObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      var carID = insertSync(carObj);
      return Cars.findOne(carID).make;
    }, carObj);
    assert.equal(result, 'BMW');
  });

  it('should be inserted successfuly without being published', function () {
    carObj['makeId'] = makeId;
    var result = server.execute(function(carObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      var carID = insertSync(carObj);
      return Cars.findOne(carID).published;
    }, carObj);
    assert.notOk(result);
  });

  it('should be inserted successfuly with good creation date', function () {
    carObj['makeId'] = makeId;
    var result = server.execute(function(carObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      var carID = insertSync(carObj);
      return Cars.findOne(carID).createdAt;
    }, carObj);
    assert.typeOf(result, 'date');
    var dateNow = new Date();
    assert.isBelow(result, dateNow);
  });

  it('should be updated successfuly with good updating date', function () {
    carObj['makeId'] = makeId;
    var result = server.execute(function(carObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      var carID = insertSync(carObj);
      var updateSync = Meteor.wrapAsync(Cars.update, Cars);
      updateSync({_id: carID}, {$set: {year: 2010}});
      return Cars.findOne(carID);
    }, carObj);
    assert.typeOf(result.updatedAt, 'date');
    var dateNow = new Date();
    assert.isBelow(result.updatedAt, dateNow);
    assert.notEqual(result.updatedAt, result.createdAt);
  });

  it('should be inserted successfuly without warranty', function () {
    carObj['makeId'] = makeId;
    var modCarObj = JSON.parse(JSON.stringify(carObj));
    delete modCarObj.warranty;
    var result = server.execute(function(modCarObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      return insertSync(modCarObj);
    }, modCarObj);
    assert.typeOf(result, 'string');
  });

  it('should be not inserted successfuly on wrong date', function () {
    carObj['makeId'] = makeId;
    var modCarObj = JSON.parse(JSON.stringify(carObj));
    modCarObj['year'] = 1899;
    var errored = server.execute(function(modCarObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      try {
        insertSync(modCarObj);
      } catch(error) {
        return true;
      }
      return false;
    }, modCarObj);
    assert.isTrue(errored, 'insert failed raising an exception');
  });
});
