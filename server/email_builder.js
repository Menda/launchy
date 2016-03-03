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
  }
};
