import {Districts, Makes, Cars} from '/collections/collections.js';
import {Images} from '/server/collections.js';


Meteor.startup(function () {
  // Districts population
  if (Districts.find().count() === 0) {
    console.log('Populating Spanish districts');

    var districtsSpain = [
      'alava', 'albacete', 'alicante', 'almeria', 'asturias', 'avila',
      'badajoz', 'barcelona', 'burgos',
      'caceres', 'cadiz', 'cantabria', 'castellon', 'ceuta', 'ciudad_real', 'cordoba', 'cuenca',
      'gerona', 'granada', 'guadalajara', 'guipuzcoa',
      'huelva', 'huesca',
      'islas_baleares',
      'jaen',
      'la_coruna', 'la_rioja', 'las_palmas', 'leon', 'lerida', 'lugo',
      'madrid', 'malaga', 'melilla', 'murcia',
      'navarra',
      'orense',
      'palencia', 'pontevedra',
      'salamanca', 'santa_cruz_de_tenerife', 'segovia', 'sevilla', 'soria',
      'tarragona', 'teruel', 'toledo',
      'valencia', 'valladolid', 'vizcaya',
      'zamora', 'zaragoza'
    ]
    var root = 'districts/spain/';
    _.each(districtsSpain, function(filename) {
      var district = JSON.parse(
        Assets.getText(root + filename + '.json'));
      Districts.insert(district);
    });
  }

  // Makes population
  if (Makes.find().count() === 0) {
    console.log('Populating Makes');
    var makes = [
      'abarth', 'alfaromeo', 'alpina', 'alpine', 'aro', 'asia', 'astonmartin', 'audi', 'austin',
      'autobianchi', 'bedford', 'bentley', 'bertone', 'bmw', 'buick', 'cadillac', 'caterham',
      'chevrolet', 'chrysler', 'citroen', 'dacia', 'daewoo', 'daf', 'daihatsu', 'daimler', 'dodge',
      'ebro', 'ferrari', 'fiat', 'ford', 'fsopolski', 'galloper', 'gme', 'honda',
      'hyundai', 'infiniti', 'innocenti', 'isuzu', 'iveco', 'jaguar', 'jeep', 'kia', 'lada',
      'lamborghini', 'lancia', 'landrover', 'ldv', 'lexus', 'leyland', 'ligier', 'lotus', 'lti',
      'mahindra', 'maruti', 'maserati', 'maybach', 'mazda', 'mercedesbenz', 'mg', 'mini',
      'mitsubishi', 'morgan', 'morris', 'nissan', 'opel', 'peugeot', 'pontiac',
      'porsche', 'proton', 'reliant', 'renault', 'rollsroyce', 'rover', 'rvi', 'saab', 'santana',
      'seat', 'skoda', 'smart', 'ssangyong', 'subaru', 'suzuki', 'talbot', 'tata',
      'tesla', 'toyota', 'triumph', 'tvr', 'umm', 'vauxhall', 'volkswagen', 'volvo', 'wartburg',
      'yugozastava', 'zaztavria'
    ]
    var root = 'makes/';
    _.each(makes, function(filename) {
      var make = JSON.parse(
        Assets.getText(root + filename + '.json'));
      Makes.insert(make);
    });
  }

  // Only development and staging
  if (Meteor.settings.public.environment === 'development'|'staging') {
    // Test users population
    if (Accounts.users.find().count() === 0) {
      console.log('Populating test Users');
      var samples = ['peibol', 'castigaliano'];
      var root = 'users/samples/';
      _.each(samples, function(filename) {
        var account = JSON.parse(
          Assets.getText(root + filename + '.json'));
        Accounts.createUser(account);
      });
    }

    // Test cars population
    if (Cars.find().count() == 0) {
      console.log('Populating test Cars');
      var samples = ['golf_vii_r', 'lotus_elise', 'mercedes_sl'];
      var root = 'cars/samples/';

      _.each(samples, function(filename) {
        var car = JSON.parse(
          Assets.getText(root + filename + '.json'));
        var make = Makes.findOne({name: car["manufacturer"]["name"]});
        delete car["manufacturer"];
        car["makeId"] = make["_id"];
        var id = Cars.insert(car);

        _.each(['01', '02', '03'], function(picindex) {
          var img = new FS.File();
          img.name(filename + '-' + picindex + '.jpg');
          var data = Assets.getBinary('cars/samples/images/' + filename + '-' + picindex + '.jpg');
          img.attachData(data, {type: "image/jpeg"});
          var imageObj = Images.insert(img);
          imageObj.update({$set: {'assigned': id}});
        });
      });
    }
  }
});
