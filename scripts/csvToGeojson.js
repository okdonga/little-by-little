console.log("hello");
const csvToJson = require("csvtojson");
const fs = require("fs");

const processFile = async () => {
  const rawData = await csvToJson({
    trim: true
  }).fromFile("03-17-2020.csv");

//   const features = [];
//   rawData.forEach(row => {
//     let feature = {
//       type: "Feature",
//       properties: {
//         Confirmed: row["Confirmed"],
//         Deaths: row["Deaths"],
//         Recovered: row["Recovered"],
//         Date: "2020-03-17"
//       },
//       geometry: {
//         type: "Point",
//         coordinates: [row["Longitude"], row["Latitude"]]
//       }
//     };

//     features.push(feature);
//   });

//   const geojsonOutput = { type: "FeatureCollection", features };
//   fs.writeFileSync("03-17-2020.geojson", JSON.stringify(geojsonOutput), "utf8");
};

processFile();
