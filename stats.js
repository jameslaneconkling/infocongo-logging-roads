const fs = require('fs');
const geojsonStream = require('geojson-stream');
const reduce = require('stream-reduce');
const infile = './logging-roads.json';

function calcFeatureCollectionStats(json) {
  return json.features.reduce((stats, feature) => {
    const startDate = feature.properties['start_date'];
    stats[startDate] = typeof stats[startDate] === 'number' ? ++stats[startDate] : 0;
    return stats;
  }, {});
}

// Without streaming
// fs.readFile(infile, 'utf8', (err, json) => {
//   if (err) {
//     console.error(err);
//   }
//   json = JSON.stringify(json);
//   console.log(calcFeatureCollectionStats(json));
// });

// With streaming
fs.createReadStream(infile, {encoding: 'utf8'})
  .pipe(geojsonStream.parse())
  .pipe(reduce((stats, feature) => {
    const startDate = feature.properties['start_date'];
    stats[startDate] = typeof stats[startDate] === 'number' ? ++stats[startDate] : 0;
    return stats;
  }, {}))
  .on('data', stats => {
    console.log(stats);
  });
