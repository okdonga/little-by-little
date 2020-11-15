const fs = require('fs')
const csvToJson = require('csvtojson');
const { LAYER_TYPE } = require('./common');

const mergeCountryList = ['Australia', 'Canada', 'China'];
const splitProvinceList = ['Netherlands', 'United Kingdom', 'France', 'Denmark'];
const fixLatLng = {
    'China': { // Gansu
        lat: 35.7518,
        lng: 104.2861
    },
    'Australia': { // South Australia
        lat: -34.9285,
        lng: 138.6007
    },
    'Canada': { // Saskatchewan
        lat: 52.9399,
        lng: -106.4509
    }
}

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

function setGroupByCountryMap({ country, province, date, cases, prevCount, change, lat, lng}) {
    return {
        country, 
        date,
        cases,
        prevCount,
        change,
        lat, 
        lng,
    }
}

function updateGroupByCountryMap(groupByCountryMap, date, dateRanges, index, row) {
    const country = row["Country/Region"];
    const province = row["Province/State"];
    const cases = +row[date]
    const prevCount = +row[dateRanges[index-1]];
    const change = count = prevCount;
    const lat = fixLatLng[country] ? fixLatLng[country]['lat'] : row['Lat'];
    const lng = fixLatLng[country] ? fixLatLng[country]['lng'] : row['Long'];
    if (groupByCountryMap[country]) {
        groupByCountryMap[country][date] = setGroupByCountryMap({ country, province, date, cases, prevCount, change, lat, lng })
    } else {
        groupByCountryMap[country] = {
            [date]: setGroupByCountryMap({ country, province, date, cases, prevCount, change, lat, lng })
            
        }
    }
    
}

function XmakeGeoJson(layer, data) {
    // console.log(layer)
    const { country, date, cases, change, lat, lng } = data;
    // console.log(data)
    let params = {
        "type": "Feature",
        "properties": {
            "country_region": country,
            "Date": date,
            [layer]: cases,
            "change": change
        },
        "geometry": {
            "type": "Point",
            "coordinates": [lng, lat],
        }
    }
    return params; 
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
    
   
    const groupByCountryMap = {};

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
                const country = row["Country/Region"];
                const province = row["Province/State"];
                const cases = +row[date]
                const prevCount = +row[dateRanges[index-1]];
                const change = count = prevCount;
                const lat = fixLatLng[country] ? fixLatLng[country]['lat'] : row['Lat'];
                const lng = fixLatLng[country] ? fixLatLng[country]['lng'] : row['Long'];

                // group by country 
                if (mergeCountryList.includes(country)) {
                    //  Australia, Canada and China are reported at the province/state level.
                    // fix lat lng point eg beijing for china 
                    if (groupByCountryMap[country]) {
                        if (groupByCountryMap[country][date]) {
                            // plus 하는 경우 
                            groupByCountryMap[country][date]['cases'] += count
                        } else {
                            // 날짜가 처음인 경우 
                            groupByCountryMap[country][date] = setGroupByCountryMap({ country, province, date, cases, prevCount, change, lat, lng })
                        }
                    } else {
                        groupByCountryMap[country] = {
                            [date]: setGroupByCountryMap({ country, province, date, cases, prevCount, change, lat, lng })
                            
                        }
                    }                    
                } else if (splitProvinceList.includes(country)) {
                    // Dependencies of the Netherlands, the UK, France and Denmark are listed under the province/state level. 
                    // set province as country
                    groupByCountryMap[province] = setGroupByCountryMap({ country, province, date, cases, prevCount, change, lat, lng })
                    // groupByCountryMap[province] = {
                    //     [date]: {
                    //         country: province,
                    //         date, 
                    //         cases: count, 
                    //         prevCount: +row[dateRanges[index-1]],
                    //         change:  count - prevCount,
                    //         lat: row['Lat'],
                    //         lng: row['Long'],
                    //     },
                        
                    // }
                } else {
                    updateGroupByCountryMap(groupByCountryMap, date, dateRanges, index, row)
                }
 
                // try {
                //   const change = count - prevCount;
                //   if (count > 0) {
                //     const res = await makeGeoJson(layer, date, count, row, change)
                //     features.push({...res})
                //   }
                // } catch(err) {
                //     console.log(err)
                // }
            })       
        }
    });

    // console.log(groupByCountryMap)
    Object.keys(groupByCountryMap).forEach(country => {
        Object.values(groupByCountryMap[country]).forEach(dailyCases => {
            if (dailyCases.cases > 0) {
                const res = XmakeGeoJson(layer, dailyCases)
                features.push({...res})
            }
        })
    })

    const geojsonOutput = { "type": "FeatureCollection", features }
    fs.writeFileSync(filename.out, JSON.stringify(geojsonOutput), 'utf8')
};

module.exports = {
    generate,    
}
