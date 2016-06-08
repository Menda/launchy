'use strict';
import {Meteor} from 'meteor/meteor';
import {DocHead} from 'meteor/kadira:dochead';


/**
 * Sets all head data like page title, metatags, etc.
 *
 * @param data Data to set the header.
 * @param data.currentUrl URL of the current open page.
 * @param data.title Page title.
 * @param data.metaDescription Meta description.
 */
export const setHead = (data) => {
  const currentUrl = data['currentUrl'];
  let title = data['title'];
  const metaDescription = data['metaDescription'];

  if (title) {
    title = title + ' | ' + Meteor.settings.public.site_name;
    DocHead.setTitle(title);
  }

  DocHead.removeDocHeadAddedTags()

  const metaLanguage = {
    'http-equiv': "Content-Language",
    content: Meteor.settings.public.language
  };
  DocHead.addMeta(metaLanguage);

  if (metaDescription) {
    const metaInfo = {
      name: "description",
      content: metaDescription
    };
    DocHead.addMeta(metaInfo);
  }

  if (currentUrl) {
    const linkCanonical = {
      rel: "canonical",
      href: currentUrl
    };
    DocHead.addLink(linkCanonical);
  }
}

export const scrollToTop = () => {
  if (Meteor.isClient) {
    $('html, body').animate({scrollTop: $('body').offset().top});
  }
}

export function getResizeDimensions(width, height, maxWidth, maxHeight) {
  if (maxWidth >= width && maxHeight >= height) {
    return [width, height];
  }
  if (width > maxWidth && height <= maxHeight) {
    const calcHeight = Math.round(height * maxWidth / width);
    return [maxWidth, calcHeight];
  }
  if (height > maxHeight && width <= maxWidth) {
    const calcWidth = Math.round(width * maxHeight / height);
    return [calcWidth, maxHeight];
  }
  if (maxWidth < width && maxHeight < height) {
    if ((width / maxWidth) > (height / maxHeight)) {
      const calcHeight = Math.round(height * maxWidth / width);
      return [maxWidth, calcHeight];
    } else if ((width / maxWidth) < (height / maxHeight)) {
      const calcWidth = Math.round(width * maxHeight / height);
      return [calcWidth, maxHeight];
    } else {
      return [maxWidth, maxHeight];
    }
  }
}

export function safeCallback(callback) {
  // Make callback safe for Meteor code
  return Meteor.bindEnvironment(callback, function(err) { throw err; });
}
