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
  Make: {
    type: Schemas.Make // cambiar a Mongo.Collection, para que sea un string _id
                       // pues en la bd no está insertando una referencia, sino
                       // mucha movida
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
