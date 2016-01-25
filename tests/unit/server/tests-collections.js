
describe('@focus Manufacturer', function() {
  beforeEach(function() {
    server.execute(function() {
      Manufacturers.remove({});
    });
  });

  it('should be inserted successfuly', function () {
      var result = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Manufacturers.insert, Manufacturers);
        return insertSync({name: 'Ferrari', description: 'Sportive!'});
      });
      assert.typeOf(result, 'string', 'insert method return a string on success');
  });

  it('should be inserted successfuly without optional', function () {
      var result = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Manufacturers.insert, Manufacturers);
        return insertSync({name: 'Ferrari', description: null});
      });
      assert.typeOf(result, 'string', 'insert method return a string on success');
  });

  it('should validate successfuly with null optional', function () {
      var successed = server.execute(function() {
        obj = {name: 'Ferrari', description: null};
        return Manufacturers.simpleSchema().namedContext().validate(obj);
      });
      assert.isTrue(successed);
  });

  it('should validate successfuly without optional', function () {
      var successed = server.execute(function() {
        obj = {name: 'Ferrari'};
        return Manufacturers.simpleSchema().namedContext().validate(obj);
      });
      assert.isTrue(successed);
  });

  it('should not validate successfuly', function () {
      var errored = server.execute(function() {
        obj = {name: 'Ferrari', invented: 'made_up'};
        return ! Manufacturers.simpleSchema().namedContext().validate(obj);
      });
      assert.isTrue(errored, 'insert failed raising an exception');
  });

  // TODO: Wait for answer, possible bug:
  // https://github.com/aldeed/meteor-collection2/issues/303
  /*it('should be not inserted successfuly', function () {
      var errored = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Manufacturers.insert, Manufacturers);
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
  beforeEach(function() {
    server.execute(function() {
      Manufacturers.remove({});
      Districts.remove({});
      Cars.remove({});
    });
  });

  // Prepare data
  var districtObj = {country: 'España', region: 'País Vasco', district: 'Vizcaya'};
  var manufacturerObj = {name: 'BMW'};
  var carObj = {
    manufacturer: manufacturerObj,
    title: 'BMW 7 Series F01 730d SE N57 3.0d',
    color: 'Pure Metal Silver',
    transmission: 'Automatic DSG',
    year: 2015,
    kilometers: 120000,
    district: districtObj,
    warranty: '2 years with unlimited kilometers',
  };

  it('should be inserted successfuly', function () {
    var result = server.execute(function(carObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      return insertSync(carObj);
    }, carObj);
    assert.typeOf(result, 'string');
  });

  it('should be inserted successfuly without being published', function () {
    var result = server.execute(function(carObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      var carID = insertSync(carObj);
      return Cars.findOne(carID).published;
    }, carObj);
    assert.notOk(result);
  });

  it('should be inserted successfuly with good creation date', function () {
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

  it('should be not inserted successfuly on wrong date', function () {
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

  it('should be inserted successfuly without warranty', function () {
    var modCarObj = JSON.parse(JSON.stringify(carObj));
    delete modCarObj.warranty;
    var result = server.execute(function(modCarObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      return insertSync(modCarObj);
    }, modCarObj);
    assert.typeOf(result, 'string');
  });
});
