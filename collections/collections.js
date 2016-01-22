
Manufacturers = new Mongo.Collection('manufacturers');
Districts = new Mongo.Collection('districts');
Cars = new Mongo.Collection("cars");

var Schemas = {};

Schemas.Manufacturer = new SimpleSchema({
  name: {
    type: String,
    max: 70
  },
  description: {
    type: String,
    optional: true
  }
});

Schemas.District = new SimpleSchema({
  country: {
    type: String
  },
  region: {
    type: String
  },
  district: {
    type: String
  }
});

Schemas.Car = new SimpleSchema({
  manufacturer: {
    type: Schemas.Manufacturer
  },
  title: {
    type: String,
    max: 200
  },
  color: {
    type: String,
    max: 100
  },
  transmission: {
    type: String,
    max: 100
  },
  year: {
    type: Number,
    min: 1900
  },
  kilometers: {
    type: Number,
    min: 0
  },
  district: {
    type: Schemas.District
  },
  warranty: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  }
});

Manufacturers.attachSchema(Schemas.Manufacturer);
Districts.attachSchema(Schemas.District);
Cars.attachSchema(Schemas.Car);
