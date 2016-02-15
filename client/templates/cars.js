Template.cars.helpers({
  cars: function () {
    return Cars.find({'published': true}); // TODO: limit fields
  }
});

Template.car.helpers({
  urlCarDetails: function() {
    var car = this;
    var params = {
        _id: car._id
    };
    var routeName = 'carDetails';
    var path = FlowRouter.path(routeName, params);
    return path;
  }
});
