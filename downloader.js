const fs = require('fs');
const overpass = require('query-overpass');

// [south, west, north, east]
const bbox = [-13.5, 8.5, 13.4, 31.2];
const outfile = './logging-roads.json';
// OverpassQL documentation: http://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
const query = `
  [out:json][timeout:25];
  (
    way["highway"="track"]["access"="forestry"]( ${bbox.join()} );
    way["highway"="track"]["access"="agriculture"]( ${bbox.join()} );
    way["abandoned:highway"="track"]["access"="forestry"]( ${bbox.join()} );
    way["abandoned:highway"="track"]["access"="agricultural"]( ${bbox.join()} );
  );
  out body;
  >;
  out skel qt;
`;

function processGeoJSON(json) {
  json.features = json.features.map(feature => {
    delete feature.properties.type;
    delete feature.properties.relations;
    delete feature.properties.meta;

    Object.assign(feature.properties, {
      id: feature.properties.tags['id'],
      access: feature.properties.tags['access'],
      start_date: feature.properties.tags['start_date'],
      end_date: feature.properties.tags['end_date'],
      source: feature.properties.tags['source']
    });
    delete feature.properties.tags;

    return feature;
  });

  return json;
}

console.log(`query overpass:\n${query}\n`);
overpass(query, (err, data) => {
  if (err) {
    return console.log(err);
  }

  // data.features = data.features.slice(0,100);
  console.log(`write to file. ${data.features.length} features`);
  data = processGeoJSON(data);

  fs.writeFile(outfile, JSON.stringify(data), err => {
    if (err) {
      return console.error(err);
    }
    console.log('done');
  });
});


