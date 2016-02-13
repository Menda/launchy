Forms = {};

// Inherits from Schemas.Car
Forms.createAdForm = new SimpleSchema([Schemas.Car, {
  districtId: {
    type: String
  },
  make: {
    type: String,
    optional: true
  }
}]);
