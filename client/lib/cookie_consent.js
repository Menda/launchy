'use strict';
import {CookieConsent} from 'meteor/selaias:cookie-consent';

var options = {
  cookieTitle: 'Usamos Cookies',
  cookieMessage: 'Estamos usando cookies para darte una mejor '
     + 'experiencia el portal. Las Cookies son archivos guardados en tu '
     + 'navegador y son usados por la mayoría de sitios para '
     + 'mejorar la experiencia de navegación.',
  showLink: false,
  acceptButtonText: 'Aceptar y continuar',
  html: false,
  expirationInDays: 7
};

CookieConsent.init(options);
