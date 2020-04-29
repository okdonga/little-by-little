const csvToJson = require('csvtojson');
const fs = require('fs')
const input = process.argv[2].toLocaleLowerCase();

const LAYER_TYPE = {
    DAILY: "daily",
    CONFIRMED: "confirmed", 
    DEATHS: "deaths",
    RECOVERED: "recovered",
}

const isValidInput = [LAYER_TYPE.CONFIRMED,LAYER_TYPE.DEATHS,LAYER_TYPE.RECOVERED, LAYER_TYPE.DAILY];

if (isValidInput.indexOf(input) < 0) throw "Parameter must be either confiremd, deaths, recovered or daily";

function fileInfo(input) {
    switch(input) {
        case LAYER_TYPE.DAILY: 
            return {
                in: `./COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${LAYER_TYPE.CONFIRMED}_global.csv`,
                out: `public/data/time_series_covid19_${input}_global.geojson`
            }
        default: 
            return {
                in: `./COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${input}_global.csv`,
                out: `public/data/time_series_covid19_${input}_global.geojson`
            }
    }
}

function makeGeoJson(date, count, row, change) {
    let params = {
        "type": "Feature",
        "properties": {
            "country_region": row["Country/Region"],
            "province_state": row["Province/State"],
            "Date": date,
            [input]: count,
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
  
const processFile = async () => {
    const filename = fileInfo(input);
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
        if (input === LAYER_TYPE.DAILY) {
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
                    const res = await makeGeoJson(date, count, row, change)
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


processFile();
