describe('Manufacturers @focus', function() {
  it('schema is inserted successfuly', function () {
      var result = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Manufacturers.insert, Manufacturers);
        return insertSync({name: 'Ferrari', description: 'Sportive!'});
      });
      assert.typeOf(result, 'string', 'insert method return a string on success');
  });

  it('schema is not inserted successfuly', function () {
      var errored = server.execute(function() {
        var insertSync = Meteor.wrapAsync(Manufacturers.insert, Manufacturers);
        try {
            insertSync({name: 'Ferrari', invented: 'Bitch'});
        } catch(error) {
          return true;
        }
        return false;
      });
      assert.isTrue(errored, 'insert failed raising an exception');
  });
});
