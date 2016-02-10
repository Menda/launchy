/**
 * Sets all head data like page title, metatags, etc.
 *
 * @param data Data to set the header.
 * @param data.currentUrl URL of the current open page.
 * @param data.title Page title.
 * @param data.metaDescription Meta description.
 */
setHead = function(data) {
  var currentUrl = data['currentUrl'];
  var title = data['title'];
  var metaDescription = data['metaDescription'];

  if (title) {
    title = title + ' | ' + Meteor.settings.public.site_name;
    DocHead.setTitle(title);
  }

  DocHead.removeDocHeadAddedTags()

  var metaLanguage = {
    'http-equiv': "Content-Language",
    content: Meteor.settings.public.language
  };
  DocHead.addMeta(metaLanguage);

  if (metaDescription) {
    var metaInfo = {
      name: "description",
      content: metaDescription
    };
    DocHead.addMeta(metaInfo);
  }

  if (currentUrl) {
    var linkCanonical = {
      rel: "canonical",
      href: currentUrl
    };
    DocHead.addLink(linkCanonical);
  }
}
