import {Images} from '/client/imports/collections.js';
import {Cars} from '/collections/collections.js';


Template.carDetails.onRendered(function() {
  var carId = FlowRouter.getParam("_id");
  var car = Cars.findOne({"_id": carId},
                         {fields: {'make': 1, 'title': 1, 'district.district': 1}});
  var title = car['make'] + ' ' + car['title'] + ' en venta en ' + car['district']['district'];
  var metaDescription;
  if (car['make'] == 'Volkswagen') {
    metaDescription = '"Das Auto". Un lema tan simple no puede decir más. VW es una de las ' +
                      'marcas más legendarias de Alemania destinadas al público general.';
  } else if (car['make'] == 'Lotus') {
    metaDescription = 'Lotus ofrece no solamente tradición de la mano de la ingeniería, sino ' +
                      'que además han anteponen las sensaciones y la ligereza de sus chasis'
                      'al caballaje';
  }
  setHead({
    currentUrl: '', // TODO
    title: title,
    metaDescription: metaDescription
  });
});

Template.carDetails.helpers({
  car: function () {
    var carId = FlowRouter.getParam("_id");
    var car = Cars.findOne({"_id": carId});
    car.images = Images.find({assigned: car['_id']}).fetch();
    return car;
  },
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
