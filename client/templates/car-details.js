'use strict';
import {$} from 'meteor/jquery';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Template} from 'meteor/templating';
import {Tracker} from 'meteor/tracker';
// TODO import {PhotoSwipeUI_Default} from...

import {Images} from '/client/imports/collections.js';
import {Cars} from '/collections/collections.js';
import {Forms} from '/collections/forms.js';
import {setHead} from '/lib/utils.js';


Template.carDetails.onRendered(() => {
  let carId = FlowRouter.getParam('_id');
  Meteor.subscribe('carDetails', carId, () => {  // TODO: any other way to make it?
    const car = Cars.findOne({'_id': carId},
                           {fields: {'make': 1, 'title': 1, 'district.district': 1}});
    // TODO Sometimes I'm getting car = undefined, and the rest of the code is failing,
    // because this method is not being again executed
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


Template.picsPhotoSwipe.events({
  'click img.photoswipe': function(e) {
    const pswpElement = $('.pswp')[0];
    const photoItems = $('img.photoswipe');
    const items = [];
    let targetIndex;
    photoItems.each((i, item) => {
      if (item.src == e.target.src) {
        targetIndex = i;
      }
      items.push({
        src: item.dataset.src, // high-res
        msrc: item.src, // thumb
        w: item.dataset.width, // PhotoSwipe requires you to know the dimensions
        h: item.dataset.height, // More information: http://photoswipe.com/documentation/faq.html
        el: item
      });
    });
    const gallery = new PhotoSwipe(
      pswpElement, PhotoSwipeUI_Default, items,
      {
        index: targetIndex,
        getThumbBoundsFn: (index) => {
          const thumbnail = photoItems[index];
          const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
          const rect = thumbnail.getBoundingClientRect();
          return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
        },
        bgOpacity: 0.85,
        barsSize: {top:0,bottom:0},
        captionEl: false,
        fullscreenEl: false,
        galleryPIDs: false,
        history: false,
        mainClass: 'pswp--minimal--dark',
        shareEl: false,
        tapToClose: true,
        tapToToggleControls: false
    });
    gallery.init();
  }
});

Template.carDetails.created = () => {
  Session.set('showContactOwnerForm', false);
};

Template.carDetails.destroyed = () => {
  Session.set('showContactOwnerForm', false);
};

Template.carDetails.helpers({
  isSuccessfulEditAd() {
    return FlowRouter.getQueryParam('edited');
  },
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

/////////////////
// picsPhotoSwipe

Template.registerHelper('getHiddenImages', (images, index) => {
  return images.slice(index);
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
