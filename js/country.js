function countryByISO3(iso3) {
  var c = _g.all_countries.filter(function(d) {
    return d['iso3'] === iso3
  })[0];

  if (typeof c === 'undefined')
    throw ("iso3: " + iso3);

  return c;
}

function findCountryName(c) {
  var r = _g.all_countries.filter(function(e) {
    return e['code'] === c['id']
  })[0];

  // For debugging purposes:
  //
  // if (typeof r === 'undefined') console.warn("country not found or object is not a country:", c);

  return (r ? r['name'] : "");
}

function findCountryISO(c) {
  var r = _g.all_countries.filter(function(e) {
    return e['code'] === c['id']
  })[0];

  // For debugging purposes:
  //
  // if (typeof r === 'undefined') console.warn("country not found or object is not a country:", c);

  return (r ? r['iso3'] : "");
}

function country_get_gdp_per_capita(iso3) {
  return parseFloat(_g.countries_gdp_per_capita.filter(function(c) {
    return iso3 === c['country_code']
  })[0]['2012']);
}

function parseCountryData(d) {
  // d['context']['gdp_per_capita_2012'] = country_get_gdp_per_capita(d['iso3']);
  d['context']['electrified_2012_ratio'] = d['context']['electrified_2012'] / d['context']['population_2012'];

  d['flag_tag'] = _g.flagnames.filter_firstp('iso3', d['iso3'])['flag_tag'];

  // this is for the $.fn.subs_matcher
  //
  d['matches'] = true;
}

function cost_electrification(d) {
  var fx = (d['o_value'] / 1000000).toFixed(2);

  return "$" + fx + " B";
}

function population_electrified_by(d) {
  var x = d['value'] * _g.country['context']['population_2030'];

  var fx = (x / 1000000).toFixed(2);

  return fx + " M";
}
