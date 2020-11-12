const fs = require('fs')
const csvToJson = require('csvtojson');
const { LAYER_TYPE } = require('./common');



function fileInfo(layer) {
    switch(layer) {
        case LAYER_TYPE.DAILY: 
            return {
                in: `./COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${LAYER_TYPE.CONFIRMED}_global.csv`,
                out: `public/data/time_series_covid19_${layer}_global.geojson`
            }
        default: 
            return {
                in: `./COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${layer}_global.csv`,
                out: `public/data/time_series_covid19_${layer}_global.geojson`
            }
    }
}

function makeGeoJson(layer, date, count, row, change) {
    let params = {
        "type": "Feature",
        "properties": {
            "country_region": row["Country/Region"],
            "province_state": row["Province/State"],
            "Date": date,
            [layer]: count,
            "change": change
        },
        "geometry": {
            "type": "Point",
            "coordinates": [row['Long'], row['Lat']]
        }
    }
    return params; 
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function generate(layer) {
    const filename = fileInfo(layer);
    let dateRanges = []; 

    const rawData = await csvToJson({
        trim: true,
    })
    .on('header',(header)=>{
        header.forEach((val, idx) => {
            if (idx > 10) {
                dateRanges.push(val);
            }   
        })
    }).fromFile(filename.in);
    const features = []  
    await asyncForEach(rawData, async(row) => {
        if (layer === LAYER_TYPE.DAILY) {
            await asyncForEach(dateRanges, async (date, index) => {
                try {
                    
                  const count = +row[date];
                  const prevCount = +row[dateRanges[index-1]];
                  const change = count - prevCount;
                  
                  if (!isNaN(change)) {
                    const params = {
                        "type": "Feature",
                        "properties": {
                            "country_region": row["Country/Region"],
                            "province_state": row["Province/State"],
                            "Date": date,
                            "change": "" + change,
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [row['Long'], row['Lat']]
                        }
                      }
                      
                      features.push(params)
                  }
                  
                } catch(err) {
                    console.log(err)
                }
            })   
        } else {
            await asyncForEach(dateRanges, async (date, index) => {
                try {
                  const count = +row[date]
                  const prevCount = +row[dateRanges[index-1]];
                  const change = count - prevCount;
                  if (count > 0) {
                    const res = await makeGeoJson(layer, date, count, row, change)
                    features.push({...res})
                  }
                } catch(err) {
                    console.log(err)
                }
            })       
        }
    });

    const geojsonOutput = { "type": "FeatureCollection", features }
    fs.writeFileSync(filename.out, JSON.stringify(geojsonOutput), 'utf8')
};

module.exports = {
    generate,    
}
