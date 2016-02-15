Forms = {};

// Inherits from Schemas.Car
Forms.createAdForm = new SimpleSchema([Schemas.Car, {
  districtId: {
    type: String
  },
  make: {
    type: String,
    optional: true
  },
  tc: {
    type: Boolean,
    defaultValue: false,
    custom: function() {
      if (! this.value) {
        return 'tc-required';
      }
    }
  }
}]);

SimpleSchema.messages({
  'tc-required': 'Para crear el anuncio es obligatorio aceptar los términos y condiciones'
});
