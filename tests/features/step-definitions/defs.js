var myStepDefinitionsWrapper = function() {
  ////////////////////
  // Acceptance cookies feature

  this.Then(/^I accept the cookies$/, function() {
    if (browser.isVisible('#acceptCookies')) {
      browser.click('#acceptCookies');
    }
  });

  ////////////////////
  // Check app feature

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

    browser.timeoutsImplicitWait(1000);

    // Meet us
    browser.click('#link-meet-us');
    expect(browser.getTitle()).toMatch('Conócenos');

    browser.timeoutsImplicitWait(1000);

    // T&C
    browser.click('#link-tc');
    expect(browser.getTitle()).toMatch('Términos y Condiciones');
  });

  this.Then(/^Private links work as expected$/, function() {
    browser.waitForExist('.dropdown-toggle');
    browser.click('.dropdown-toggle');
    browser.waitForExist('#link-my-ads');
    browser.click('#link-my-ads');
    expect(browser.getTitle()).toMatch('Mis anuncios');
  });

  ////////////////////
  // Create ad feature

  this.Given(/^I have visited the createAd$/, function() {
    browser.url(process.env.ROOT_URL + '/crear-anuncio');
  });

  this.When(/^I fill a basic ad$/, function() {
    browser.setValue('#form-title', 'Leon Cupra 290');
    browser.setValue('#form-price', '22000');
    browser.setValue('#form-year', '2015');
    browser.setValue('#form-kilometers', '2500');
    browser.selectByValue('#form-fuel', 'petrol');
    browser.selectByValue('#form-transmission', 'manual');
    browser.setValue('#form-description', 'Unidad muy especial y limitada.');
    browser.setValue('#form-email', 'fake@email.com');
    browser.setValue('#form-phone', '655443322');
    browser.setValue('#form-fullname', 'Pepe Perol');

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

  this.When(/^"([^"]*)" is not filled$/, function(selector) {
    browser.setValue('#form-' + selector, '');
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

  ///////////////////////
  // Contact form feature

  this.Given(/^I visit the car list page$/, function () {
    browser.url(process.env.ROOT_URL + '/coches');
  });

  this.Given(/^I click on any car$/, function () {
    browser.waitForExist('a.card-car-ad');
    browser.click('a.card-car-ad');
  });

  this.Given(/^I click the contact seller button$/, function () {
    browser.waitForExist('#contact-owner');
    browser.click('#contact-owner');
  });

  this.When(/^I fill the contact form$/, function () {
    browser.setValue('#form-name', 'Wechewere Alaperri');
    browser.setValue('#form-email', 'wecher@misdies.com');
    browser.setValue('#form-message', 'Ola k ase\n\nPor aquí todo bien.');
  });

  this.When(/^submit the form$/, function () {
    browser.submitForm('#contactOwnerForm');
  });

  this.Then(/^I expect a success message$/, function () {
    browser.waitForExist('#success-contact-owner-form');
  });
};

module.exports = myStepDefinitionsWrapper;