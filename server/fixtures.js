Meteor.startup(function () {
  // Test users population (only development and staging)
  if (Meteor.settings.public.environment === 'development'||'staging') {
    if (Accounts.users.find().count() === 0) {
      console.log('Populating test users');
      var usersSamples = ['peibol', 'castigaliano'];
      var root = 'users/samples/';
      _.each(usersSamples, function(filename) {
        var account = JSON.parse(
          Assets.getText(root + filename + '.json'));
        Accounts.createUser(account);
      });
    }
  }

  // Districts population
  if (Districts.find().count() === 0) {
    console.log('Populating Spanish districts');

    var districtsSpain = [
      'alava', 'albacete', 'alicante', 'almeria', 'asturias', 'avila',
      'badajoz', 'barcelona', 'burgos',
      'caceres', 'cadiz', 'cantabria', 'castellon', 'ceuta', 'ciudad_real', 'cordoba', 'cuenca',
      'gerona', 'granada', 'guadalajara', 'guipuzcoa',
      'huelva', 'huesca',
      'islas_baleares',
      'jaen',
      'la_coruna', 'la_rioja', 'las_palmas', 'leon', 'lerida', 'lugo',
      'madrid', 'malaga', 'melilla', 'murcia',
      'navarra',
      'orense',
      'palencia', 'pontevedra',
      'salamanca', 'santa_cruz_de_tenerife', 'segovia', 'sevilla', 'soria',
      'tarragona', 'teruel', 'toledo',
      'valencia', 'valladolid', 'vizcaya',
      'zamora', 'zaragoza'
    ]
    var root = 'districts/spain/';
    _.each(districtsSpain, function(filename) {
      var district = JSON.parse(
        Assets.getText(root + filename + '.json'));
      Districts.insert(district);
    });
  }
});
