const csvToJson = require('csvtojson');
const fs = require('fs')
const filename = 'time_series_covid19_confirmed_global';

let dateRanges = []; 

function testing(features, date, count, row) {
    let params = {
        "type": "Feature",
        "properties": {
            "country_region": row["Country/Region"],
            "province_state": row["Province/State"],
        },
        "geometry": {
            "type": "Point",
            "coordinates": [row['Long'], row['Lat']]
        }
    }

    params['properties']["Date"] = date;
    params['properties']["Confirmed"] = count

    return params; 
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
  
const features = []

const processFile = async () => {
    const rawData = await csvToJson({
        trim: true,
    })
    .on('header',(header)=>{
        header.forEach((val, idx) => {
            if (idx > 10) {
                dateRanges.push(val);
            }   
        })
    }).fromFile(`./COVID-19/csse_covid_19_data/csse_covid_19_time_series/${filename}.csv`);
  
    await asyncForEach(rawData, async(row) => {
        await asyncForEach(dateRanges, async (date) => {
            try {
              const count = +row[date]
              if (count > 0) {
                const res = await testing(features,  date, count, row)
                features.push({...res})
              }
            } catch(err) {
                console.log(err)
            }
        })       
    });

    const geojsonOutput = { "type": "FeatureCollection", features }
    fs.writeFileSync(`public/data/${filename}.geojson`, JSON.stringify(geojsonOutput), 'utf8')
};

processFile()

