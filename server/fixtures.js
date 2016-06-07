'use strict';
const fs = require('fs');

import {Accounts} from 'meteor/accounts-base';
import {Roles} from 'meteor/alanning:roles';
import {gm} from 'meteor/cfs:graphicsmagick';
// https://github.com/meteor/meteor/issues/6552
// import { Assets } from 'meteor/meteor';
import {_} from 'meteor/underscore';

import {Districts, Makes, Cars, Blogposts} from '/collections/collections.js';
import {getResizeDimensions} from '/lib/utils.js';
import {Images} from '/server/collections.js';
import {Uploadcare} from '/server/uploadcare.js';


Meteor.startup(() => {
  // Districts population
  if (Districts.find().count() === 0) {
    console.log('Populating Spanish districts');

    const districtsSpain = [
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
    const root = 'districts/spain/';
    _.each(districtsSpain, (filename) => {
      const district = JSON.parse(
        Assets.getText(root + filename + '.json'));
      Districts.insert(district);
    });
  }

  // Makes population
  if (Makes.find().count() === 0) {
    console.log('Populating Makes');
    const makes = [
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
    const root = 'makes/';
    _.each(makes, (filename) => {
      const make = JSON.parse(
        Assets.getText(root + filename + '.json'));
      Makes.insert(make);
    });
  }

  if (Accounts.users.find().count() === 0) {
    console.log('Populating Admins and Employees');
    const samples = ['admin', 'employee_carlos'];
    const root = 'users/production/';
    _.each(samples, (filename) => {
      const account = JSON.parse(
        Assets.getText(`${root}${filename}.json`));
      if (! account['password']) {
        account['password'] = Meteor.settings.private.users[filename]['password'];
      }
      try {
        const userId = Accounts.createUser(account);
        const roles = Meteor.settings.private.users[filename]['roles'];
        Roles.addUsersToRoles(userId, roles);
      } catch (error) { }
    });

    // Only development and staging
    if (Meteor.settings.public.environment === 'development'|'staging') {
      // Test users population
      console.log('Populating test Users');
      const samples = ['peibol', 'castigaliano'];
      const root = 'users/samples/';
      _.each(samples, (filename) => {
        const account = JSON.parse(
          Assets.getText(`${root}${filename}.json`));
        Accounts.createUser(account);
      });
    }
  }

  if (Meteor.settings.public.environment === 'development'|'staging') {
    // Test cars population
    if (Cars.find().count() == 0) {
      console.log('Populating test Cars');
      const uploadcare = new Uploadcare();

      const samples = ['golf_vii_r', 'lotus_elise', 'mercedes_sl'];
      const root = 'cars/samples/';
      _.each(samples, (filename) => {
        const car = JSON.parse(
          Assets.getText(root + filename + '.json'));
        const make = Makes.findOne({name: car['manufacturer']['name']});
        delete car['manufacturer'];
        car['makeId'] = make['_id'];
        const id = Cars.insert(car);

        const images = [];
        _.each(['01', '02', '03'], (picindex) => {
          const imagePath = `cars/samples/images/${filename}-${picindex}.jpg`;
          const imageAbsPath = Assets.absoluteFilePath(imagePath);

          const readStream = fs.createReadStream(imageAbsPath);
          gm(readStream).size({bufferStream: true}, FS.Utility.safeCallback((err, size) => {
            const res = uploadcare.uploadFileSync(imageAbsPath, 2000);
            const uuid = JSON.parse(res.body).file;

            // Save image
            const [measuredImgSize, measuredImgWidth, measuredImgHeight] =
              Uploadcare.getImageSize(
                uuid, size.width, size.height,
                Meteor.settings.private.uploadcare.size_img);
            const imageResult = uploadcare.saveImage(uuid, measuredImgSize);

            // Save thumbnail
            const [measuredThumbSize, measuredThumbWidth, measuredThumbHeight] =
              Uploadcare.getImageSize(
                uuid, size.width, size.height,
                Meteor.settings.private.uploadcare.size_thumb);
            const thumbResult = uploadcare.saveImage(uuid, measuredThumbSize);

            const imgPairMetadata = {
              image: {
                uuid: uuid,
                url: imageResult.headers.location,
                size: {
                  height: measuredImgHeight,
                  width: measuredImgWidth
                }
              },
              thumb: {
                uuid: uuid,
                url: thumbResult.headers.location,
                size: {
                  width: measuredThumbWidth,
                  height: measuredThumbHeight
                }
              }
            };

            Cars.update({_id: id}, {$push: {images: imgPairMetadata}});
            uploadcare.removeFile(uuid);
          }));
        });
      });
    }

    // Test blogposts population
    if (Blogposts.find().count() == 0) {
      console.log('Populating test Blogposts');
      const samples = ['blogpost_01', 'blogpost_02', 'blogpost_03', 'blogpost_04', 'blogpost_05'];
      const root = 'blogposts/samples/';

      _.each(samples, (filename) => {
        const blogpost = JSON.parse(
          Assets.getText(root + filename + '.json'));
        blogpost['createdAt'] = new Date();
        const id = Blogposts.insert(blogpost);
      });
    }
  }
});
