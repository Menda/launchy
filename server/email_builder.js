'use strict';
import {Meteor} from 'meteor/meteor';


export const EmailBuilder = {
  /**
   * @summary Returns an email data used to inform the admin about a new car added.
   * @param {Object} data an objects with the fields:
   * @param {String} data.to To whom is this email going.
   * @param {String} data.make Brand of the car.
   * @param {String} data.title Title of the ad.
   * @param {String} data.id The id of the new ad.
   */
  adminNewAd(data) {
    return {
      from: Meteor.settings.private.emails.from,
      to: data.to,
      subject: `Nuevo anuncio: ${data.make} ${data.title}`,
      text: `ID: ${data.id}`
      //replyTo: '' TODO use userId to get the email address, but be careful with
      //            profiles opened with Facebook, Google, etc!
    };
  },
  /**
   * @summary Returns an email data used to inform the admin about a new car added.
   * @param {Object} data an objects with the fields:
   * @param {String} data.car The ad
   * @param {String} data.to To whom is this email going.
   * @param {String} data.name Name of the person asking
   * @param {String} data.email Email of the person asking for info
   * @param {String} data.message Message from the person
   */
  contactOwner(data) {
    const carUrl = FlowRouter.path('carDetails', {_id: data.car._id});
    const url = process.env.ROOT_URL + carUrl;

    let text = `Name: ${data.name}\nEmail: ${data.email}\n` +
               `Coche: ${url}\n` + 
               `Dueño original: ${data.car.contact.fullname} <${data.car.contact.email}>`;
    if (data.car.contact.phone) {
      text = text + ` - ${data.car.contact.phone}`;
    }
    text = text + `\n\n${data.message}`;

    return {
      to: data.to,
      from: data.email,
      subject: `Contacto. ${data.name} - ${data.car.make} ${data.car.title}`,
      text: text
    }
  }
};
