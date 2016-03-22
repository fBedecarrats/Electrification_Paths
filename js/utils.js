function getQueryParam(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);

  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function tier_cost_per_capita(country, diesel_price, tier, tech) {
  var t = (function() {
    if (tech === "grid") return "grid";
    else if (tech === "micro_grid") return "mg";
    else if (tech === "stand_alone") return "sa";
  })();

  var c = country['context'];

  var project_cost = country["summary_" + diesel_price + tier]["cost_" + t];

  // HOW many will be born un-electrified? This is the lame version:
  //
  var newly_electrified = c['population_2030'] - (c['population_2012'] - c['electrified_2012']);

  return project_cost / newly_electrified;
}

function average(list, property_function) {
  return list.map(property_function).reduce(function(a, b) {
    return a + b
  }) / list.length;
}

function setup_project_countries(data, callback) {
  _g.all_countries = data;

  var filtered_countries = data.filter(function(d) {
    if (_g.exception_countries.indexOf(d['iso3']) > -1) {
      parseCountryData(d);

      return true;
    }

    if (_g.ignored_countries.indexOf(d['iso3']) > -1 ||
      _g.ignored_subregions.indexOf(d['subregion']) > -1)
      return false;

    if (d.region === 'AFRICA' || _g.exception_countries.indexOf(d['iso3']) > -1) {
      parseCountryData(d);

      return true;
    } else
      return false;
  });

  _g.target_countries = filtered_countries.sort(function(a, b) {
    return a['name'].localeCompare(b['name']);
  });

  callback();
}

function pentagon_position(direction, container_size) {
  var dir = direction % 5;

  var pi25 = Math.PI * 2 / 5;
  var pi34 = Math.PI * 3 / 2;

  var angle = (dir * pi25) + pi34;

  return {
    x: -1 * (Math.cos(angle) * container_size),
    y: (Math.sin(angle) * container_size)
  }
}
