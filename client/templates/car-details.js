'use strict';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';
import {Tracker} from 'meteor/tracker';

import {Images} from '/client/imports/collections.js';
import {Cars} from '/collections/collections.js';
import {Forms} from '/collections/forms.js';
import {setHead} from '/lib/utils.js';


Template.carDetails.onRendered(function() {
  Meteor.subscribe("cars", () => {
    const carId = FlowRouter.getParam('_id');
    const car = Cars.findOne({'_id': carId},
                           {fields: {'make': 1, 'title': 1, 'district.district': 1}});
    const title = `${car['make']} ${car['title']} en venta en ${car['district']['district']}`;
    let metaDescription;
    if (car['make'] == 'Volkswagen') {
      metaDescription = '"Das Auto". Un lema tan simple no puede decir más. VW es una de las ' +
                        'marcas más legendarias de Alemania destinadas al público general.';
    } else if (car['make'] == 'Lotus') {
      metaDescription = 'Lotus ofrece no solamente tradición de la mano de la ingeniería, sino ' +
                        'que además han anteponen las sensaciones y la ligereza de sus chasis'
                        'al caballaje';
    }
    setHead({
      currentUrl: FlowRouter.path('carDetails', {_id: carId}),
      title: title,
      metaDescription: metaDescription
    });
  });
});

Template.picsCarousel.onRendered(function() {
  $('.owl-carousel').owlCarousel({
    // TODO use lazyLoad: true
    // http://www.owlcarousel.owlgraphic.com/docs/api-options.html
    responsiveClass: true,
    margin: 10,
    nav: true,
    dots: false,
    navText: ["Anterior","Siguiente"],
    responsive: {
      0: {
        center: true,
        margin: 5,
        items: 2,
        nav: false
      },
      600: {
        items: 3
      },
      1000: {
        items: 4,
        loop: false
      }
    }
  });

  // Encode all URIs, so there are no illegal chars for images
  $('.fluidbox-img').each(function() {
    const imgs = $(this).find('img');
    $.each(imgs, function(key, img) {
      img.src = img.src.replace(' ', '%20');
    });
    this.href = this.href.replace(' ', '%20');
  });

  // Prepare all Fluidbox events
  $(function () {
    $('.fluidbox-img').fluidbox();
  });
  $('.fluidbox-img')
    .on('openstart.fluidbox', function() {
      $('.navbar-static-top').addClass('navbar-static-top-piczoom');
      $('.owl-stage-outer').addClass('owl-stage-outer-piczoom');
      $('#car-details-spec').addClass('car-details-spec-piczoom');
      $('.owl-prev').addClass('owl-prev-piczoom');
      $('.owl-next').addClass('owl-next-piczoom');
      $('footer.footer').addClass('footer-piczoom');
    })
    .on('closeend.fluidbox', function() {
      $('.navbar-static-top').removeClass('navbar-static-top-piczoom');
      $('.owl-stage-outer').removeClass('owl-stage-outer-piczoom');
      $('#car-details-spec').removeClass('car-details-spec-piczoom');
      $('.owl-prev').removeClass('owl-prev-piczoom');
      $('.owl-next').removeClass('owl-next-piczoom');
      $('footer.footer').removeClass('footer-piczoom');
  }).fluidbox();
});

Template.carDetails.created = () => {
  Session.set('showContactOwnerForm', false);
};

Template.carDetails.destroyed = () => {
  Session.set('showContactOwnerForm', false);
};

Template.carDetails.helpers({
  showContactOwnerForm() {
    return Session.get('showContactOwnerForm');
  },
  car() {
    const carId = FlowRouter.getParam('_id');
    const car = Cars.findOne({'_id': carId});
    // Subscriptions are not ready
    if (! car) {
      return;
    }
    car.images = Images.find({assigned: car['_id']}).fetch();
    return car;
  },
  urlCarDetails() {
    const car = this;
    const params = {
        _id: car._id
    };
    const routeName = 'carDetails';
    const path = FlowRouter.path(routeName, params);
    return path;
  }
});

Template.carDetails.events({
  'click #contact-owner': () => {
    $('html, body').animate({scrollTop: $("#contact-owner").offset().top});
    Session.set('showContactOwnerForm', true);
  }
});

///////////////////
// contactOwnerForm

Template.contactOwnerForm.created = () => {
  Session.set('successfulContactOwner', false);
};

Template.contactOwnerForm.destroyed = () => {
  Session.set('successfulContactOwner', false);
};

Template.contactOwnerForm.helpers({
  contactOwnerFormSchema() {
    return Forms.contactOwnerFormSchema;
  },
  isSuccessfulContactOwner() {
    return Session.get('successfulContactOwner');
  }
});

AutoForm.hooks({
  'contactOwnerForm': {
    onSuccess(formType, result) {
      console.log('Form "contactOwnerForm" sent successfully!');
      Session.set('successfulContactOwner', true);
    }
  }
});
