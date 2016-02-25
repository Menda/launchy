var myStepDefinitionsWrapper = function() {
  this.Given(/^I have visited the homepage$/, function() {
    browser.url(process.env.ROOT_URL);
  });

  this.Then(/^I see the header "([^"]*)"$/, function(expectedTitle) {
    return browser.waitForExist('h1=' + expectedTitle);
  });

  this.Then(/^Links work as expected$/, function() {
    // Homepage
    browser.click('#link-homepage-logo');
    expect(browser.getTitle()).toMatch(
      'Compra y venta de coches de gama alta, clásicos y de disfrute');

    // All cars
    browser.click('#link-cars');
    expect(browser.getTitle()).toMatch('Mercado de automóviles de lujo');

    // Create ad
    browser.click('#link-create-ad');
    expect(browser.getTitle()).toMatch('Crear anuncio de tu coche');
  });

  this.Given(/^I have visited the createAd$/, function() {
    browser.url(process.env.ROOT_URL + '/crear-anuncio');
  });

  this.When(/^I fill a basic ad$/, function() {
    browser.setValue('#form-title', 'Leon Cupra 280');
    browser.setValue('#form-price', '22000');
    browser.setValue('#form-year', '2015');
    browser.setValue('#form-kilometers', '2500');
    browser.selectByValue('#form-fuel', 'petrol');
    browser.selectByValue('#form-transmission', 'manual');

    // Wait until all makes are populated from DB
    browser.waitUntil(function() {
      return this.getText('#form-makeId > option', function(err, res) {
        return (typeof res == 'object' && res.length > 10);
      });
    });
    browser.selectByVisibleText('#form-makeId', 'Seat');

    // Wait until all districts are populated from DB
    browser.waitUntil(function() {
      return this.getText('#form-districtId option', function(err, res) {
        return (typeof res == 'object' && res.length > 10);
      });
    });
    browser.selectByVisibleText('#form-districtId', 'Cantabria');
  });

  this.When(/^Add a picture to it$/, function () {
    browser.chooseFile(
      '#form-images', 'tests/features/img/pic.jpg');
    browser.waitForExist('div.media');
  });

  this.When(/^Check the T&C$/, function () {
    browser.click('#form-tc');
  });

  this.When(/^Submit the form$/, function () {
    browser.click('button[type=submit]');
  });

  this.Then(/^I see the 'almost there' page$/, function() {
    var expectedTitle = '¡Ya te queda poco! Inicia sesión o regístrate, por favor';
    return browser.waitForExist('h1=' + expectedTitle);
  });

  this.Then(/^I see the success page$/, function() {
    var expectedTitle = '¡Gracias por anunciar tu coche con nosotros!';
    return browser.waitForExist('h1=' + expectedTitle);
  });

  this.Then(/^I the car inserted in the database$/, function() {
    /*
     * TODO fix this checking 'My ads'
    var img = server.execute(function() {
      //import {Cars} from '/collections/collections.js';
      //require('./collections/collections.js')
      var car = Cars.findOne({published: false}, {sort: {createdAt: -1, limit: 1}});
      var img = Images.findOne({assigned: car._id});
      return img;
    });
    expect(img['original']['name']).toMatch('pic.jpg');*/
  });

  this.Then(/^I see an error in the form$/, function() {
    return browser.waitForExist('.has-error');
  });

  this.Given(/^I am not logged in$/, function () {
    client.execute(function() {
      Meteor.logout();
    });
  });

  this.Given(/^I have an account$/, function () {
    server.execute(function() {
      try {
        Accounts.createUser({
          email: "any@email.com",
          password: "<PASSWORD>",
          profile: {name: "<USERNAME>"}
        });
      } catch (e) {}
    });
  });

  this.Given(/^I am logged in$/, function() {
    client.execute(function() {
      Meteor.loginWithPassword('any@email.com', '<PASSWORD>');
    });
  });

  this.When(/^I log in$/, function () {
    client.execute(function() {
      Meteor.loginWithPassword('any@email.com', '<PASSWORD>');
    });
  });
};

module.exports = myStepDefinitionsWrapper;