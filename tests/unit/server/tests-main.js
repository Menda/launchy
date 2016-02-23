describe('@focus assignAccountAd', function() {
  beforeEach(function() {
    server.execute(function() {
      Makes.remove({});
      Districts.remove({});
      Cars.remove({});
    });

    // Insert a make
    server.execute(function() {
      var makeObj = {'_id': 'makeId', 'name': 'BMW', '_value': 'xxx'};
      var insertSync = Meteor.wrapAsync(Makes.insert, Makes);
      insertSync(makeObj);
      Makes.findOne({name: makeObj['name']})['_id'];
    });
    // Insert a car
    var districtObj = {country: 'España', region: 'País Vasco', district: 'Vizcaya'};
    var carObj = {
      _id: 'carId',
      makeId: 'makeId',
      title: 'BMW 7 Series F01 730d SE N57 3.0d',
      price: 34000,
      color: 'Pure Metal Silver',
      fuel: 'diesel',
      transmission: 'automatic',
      doors: 4,
      body: 'sedan',
      horsepower: 256,
      year: 2015,
      kilometers: 120000,
      district: districtObj,
      warranty: '2 years with unlimited kilometers',
    };
    server.execute(function(carObj) {
      var insertSync = Meteor.wrapAsync(Cars.insert, Cars);
      return insertSync(carObj);
    }, carObj);
  });

  it('should reject invalid params are passed', function () {
    expect(function() {
      server.call('assignAccountAd');
    }).to.throw('403');

    expect(function() {
      server.apply('assignAccountAd', ['<USER_ID>', null]);
    }).to.throw('403');

    expect(function() {
      server.apply('assignAccountAd', [null, '<CAR_ID>']);
    }).to.throw('403');
  });

  it('should deny when carId is not found', function () {
    expect(function() {
      server.apply('assignAccountAd', ['<USER_ID>', '<FAKE>']);
    }).to.throw('403');
  });

  it('should deny when user is assigned already', function () {
    server.execute(function() {
      var updateSync = Meteor.wrapAsync(Cars.update, Cars);
      return updateSync({_id: 'carId'}, {$set: {userId: '<USER_ID>'}});
    });

    expect(function() {
      server.apply('assignAccountAd', ['<USER_ID>', 'carId']);
    }).to.throw('403');
  });

  it('should go fine when no user was assigned', function () {
    server.apply('assignAccountAd', ['<USER_ID>', 'carId']);
    var car = server.execute(function() {
      return Cars.findOne({_id: 'carId'});
    });
    assert.equal(car.userId, '<USER_ID>');
  });
});
