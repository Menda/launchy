Makes = new Mongo.Collection('makes');
Districts = new Mongo.Collection('districts');
Cars = new Mongo.Collection("cars");

var Schemas = {};

Schemas.Make = new SimpleSchema({
  name: {
    type: String,
    max: 70
  },
  description: {
    type: String,
    optional: true
  },
  allowed: {
    type: Boolean,
    optional: true
  },
  _value: {
    type: String
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
  makeId: {
    type: Meteor.ObjectID
  },
  modelId: {
    type: Meteor.ObjectID,
    optional: true
  },
  engineId: {
    type: Meteor.ObjectID,
    optional: true
  },
  title: {
    type: String,
    max: 200
  },
  price: {
    type: Number,
    min: 0
  },
  color: {
    type: String,
    max: 100
  },
  fuel: {
    type: String,
    allowedValues: ['petrol', 'diesel', 'hybrid', 'lpg', 'electric']
  },
  transmission: {
    type: String,
    max: 100
  },
  doors: {
    type: Number,
    optional: true
  },
  body: {
    type: String,
    allowedValues: ['hatchback', 'cabrio', 'coupé', 'targa', 'wagon', 'sedan'],
    optional: true
  },
  horsepower: {
    type: Number,
    optional: true
  },
  wheelDrive: {
    type: String,
    allowedValues: ['fwd', 'rwd', 'awd', '4wd'],
    optional: true
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
  published: {
    type: Boolean,
    defaultValue: false,
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

Makes.attachSchema(Schemas.Make);
Districts.attachSchema(Schemas.District);
Cars.attachSchema(Schemas.Car);
