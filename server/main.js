Meteor.startup(function () {
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
    var districtsSpainRoot = 'districts/spain/';
    _.each(districtsSpain, function(districtName) {
      var district = JSON.parse(
        Assets.getText(districtsSpainRoot + districtName + '.json'));
      Districts.insert(district);
    });
  }
});
