// https://docs.mapbox.com/help/tutorials/show-changes-over-time/
// https://github.com/CSSEGISandData/COVID-19.git 
import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./Default.css";
import { FILENAME, LAYER_TYPE, LEGION_COLORS, LEGION_RANGE } from "./constant";
import { numberWithCommas } from './util/number';
import { generateDates } from "./util/date";

mapboxgl.accessToken = "pk.eyJ1Ijoib2tkb25nIiwiYSI6ImNrN2JvcHJiODBkYjgzZW1zaGF2ZjVuenIifQ.9XNG94jkM8x0sNWzC8aJvQ";

const mapContainerStyle = {
  position: "relative",
  height: "100vh"
};

const mapStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "100%"
};

const consoleStyle = {
  top: "0px",
  position: "absolute",
  width: "100vw",
  backgroundColor: "gray",
};

const legendStyle = {
  position: "absolute",
  width: "50px",
  height: "295px",
  right: "20px",
  backgroundColor: "gray",
  margin: "10px",
  padding: "10px 20px",
  textAlign: "center",
  top: '50%',
  transform: 'translateY(-50%)',
}

const inputRangeStyle = {
  position: "absolute",
  height: "40px",
  bottom: "20px",
  width: "100%",
  margin: "20px 0px",
  padding: "10px 0px",
  backgroundColor: "gray"
}

const DEFAULT_DATE_FORMAT = 'M/D/YY';

function Timeseries() {
  const mapContainer = useRef();
  const [mapProperty, setMapProperty] = useState({
    lng: -74.0059,
    lat: 40.7128,
    zoom: 3
  });

  const [dateIndex, setDateIndex]= useState(0);
  const [dateRange, setDateRange] = useState(generateDates('2020-01-29', new Date(), DEFAULT_DATE_FORMAT));
  const [map, setMap] = useState(null);
  const [layer, setLayer] = useState(LAYER_TYPE.CONFIRMED);

  useEffect(() => {
    const { lat, lng, zoom } = mapProperty;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      // style: "mapbox://styles/mapbox/streets-v8",
      style: "mapbox://styles/okdong/ck7wy98vm0rci1is55mx98fxi",
      // style: "mapbox://styles/okdong/ck7bogbxr0jcw1inv3e9pcv1e",
      center: [lng, lat],
      zoom
    });

    setMap(map);

    map.on("load", function() {
      // map.addSource("corona", {
      //   type: "geojson",
      //   // data: "./data/03-17-2020.geojson" // replace this with the url of your own geojson
      //   data: "./data/time_series_covid19_confirmed_global.geojson" // replace this with the url of your own geojson
      // });
      map.addLayer({
        id: 'daily',
        type: 'symbol',
        // type: "circle",
        source: {
          type: "geojson",
          data: FILENAME[LAYER_TYPE.DAILY],
        },
        // paint: {
        //   "circle-radius": [
        //     'interpolate', ['linear'], ["get", "change"],
        //     // confirmed count is 1000 (or less) -> circle radius will be 5px
        //     100, 5, 
        //     12500, 20,
        //     50000, 30,
        //     200000, 50, 
        //     500000, 80, 
        //     800000, 100
        //   ],
        //   "circle-color": [
        //     "interpolate",
        //     ["linear"],
        //     ["number", ["get", "change"]],
        //     100,
        //     "#FFA07A",
        //     12500,
        //     "#F08080",
        //     50000,
        //     "#CD5C5C",
        //     200000,
        //     "#DC143C",
        //     500000,
        //     "#B22222",
        //     800000,
        //     "#FF0000"
        //   ],
        //   //   "circle-opacity": 0.8,
        //   "circle-opacity": 0.8
        // }
        paint: {
          "text-color": "#ffffff"
        },
        layout: {
          // 'text-field': ['get', 'country_region'],
          'text-field': ['format', ['upcase', ['get', 'country_region']], { 'font-scale': 0.8 },
          '\n',
          {},
             ['downcase', ['get', 'change']],
            { 'font-scale': 0.8 }
        ], 
          // 'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          // 'text-radial-offset': 0.5,
          // 'text-justify': 'auto',
          
          // 'icon-image': ['concat', ['get', 'icon'], '-15']
          'icon-image': 'tw-provincial-2',
          // 'text-field': [
          //   'format',
          //   ['upcase', ['get', 'country_region']],
          //   { 'font-scale': 0.8 },
          //   '\n',
          //   {},
          //   ['downcase', ['get', 'change']],
          //   { 'font-scale': 0.6 }
          // ],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        },
        // "filter": [">", "change", 0]
      });

      map.setFilter("daily", ['==', 'Date', dateRange[0]]);
  

      map.addLayer({
        id: "confirmed",
        type: "circle",
        source: {
          type: "geojson",
          data: FILENAME[LAYER_TYPE.CONFIRMED],
        },
        paint: {
          "circle-radius": [
            'interpolate', ['linear'], ["get", "confirmed"],
            // confirmed count is 1000 (or less) -> circle radius will be 5px
            LEGION_RANGE.CASE_1.COUNT_CONFIRMED, LEGION_RANGE.CASE_1.RADIUS, 
            LEGION_RANGE.CASE_2.COUNT_CONFIRMED, LEGION_RANGE.CASE_2.RADIUS, 
            LEGION_RANGE.CASE_3.COUNT_CONFIRMED, LEGION_RANGE.CASE_3.RADIUS, 
            LEGION_RANGE.CASE_4.COUNT_CONFIRMED, LEGION_RANGE.CASE_4.RADIUS, 
            LEGION_RANGE.CASE_5.COUNT_CONFIRMED, LEGION_RANGE.CASE_5.RADIUS, 
            LEGION_RANGE.CASE_6.COUNT_CONFIRMED, LEGION_RANGE.CASE_6.RADIUS, 
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["number", ["get", "confirmed"]],
            LEGION_RANGE.CASE_1.COUNT_CONFIRMED,
            LEGION_COLORS.PART_1,
            LEGION_RANGE.CASE_2.COUNT_CONFIRMED,
            LEGION_COLORS.PART_2,
            LEGION_RANGE.CASE_3.COUNT_CONFIRMED,
            LEGION_COLORS.PART_3,
            LEGION_RANGE.CASE_4.COUNT_CONFIRMED,
            LEGION_COLORS.PART_4,
            LEGION_RANGE.CASE_5.COUNT_CONFIRMED,
            LEGION_COLORS.PART_5,
            LEGION_RANGE.CASE_6.COUNT_CONFIRMED,
            LEGION_COLORS.PART_6,
          ],
          "circle-opacity": 0.8
        }
      });

      // change layer 
      map.setFilter("confirmed", ['==', 'Date', dateRange[0]]);

      map.addLayer({
        id: "deaths",
        type: "circle",
        source: {
          type: "geojson",
          data: FILENAME[LAYER_TYPE.DEATHS],
        },
        layout: {
          visibility: "none"
        },
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["number", ["get", "deaths"]],
            0,
            4,
            5,
            24
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["number", ["get", "deaths"]],
            0,
            "#2DC4B2",
            1,
            "#3BB3C3",
            2,
            "#669EC4",
            3,
            "#8B88B6",
            4,
            "#A2719B",
            5,
            "#AA5E79"
          ],
          "circle-opacity": 0.8
        }
      });

      map.setFilter("deaths", ['==', 'Date', dateRange[0]]);

      map.addLayer({
        id: "daily",
        type: "circle",
        source: {
          type: "geojson",
          data: FILENAME[LAYER_TYPE.DAILY],
        },
        paint: {
          "circle-radius": [
            'interpolate', ['linear'], ["get", "active"],
            // confirmed count is 1000 (or less) -> circle radius will be 5px
            100, 5, 
            12500, 20,
            50000, 30,
            200000, 50, 
            500000, 80, 
            800000, 100
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["number", ["get", "active"]],
            100,
            "#FFA07A",
            12500,
            "#F08080",
            50000,
            "#CD5C5C",
            200000,
            "#DC143C",
            500000,
            "#B22222",
            800000,
            "#FF0000"
          ],
          //   "circle-opacity": 0.8,
          "circle-opacity": 0.8
        }
      });

      // map.addLayer({
      //   id: "recovered",
      //   type: "circle",
      //   source: "corona",
      //   layout: {
      //     visibility: "none"
      //   },
      //   paint: {
      //     "circle-radius": [
      //       "interpolate",
      //       ["linear"],
      //       ["number", ["get", "Recovered"]],
      //       0,
      //       4,
      //       5,
      //       24
      //     ],
      //     "circle-color": [
      //       "interpolate",
      //       ["linear"],
      //       ["number", ["get", "Recovered"]],
      //       0,
      //       "#2DC4B2",
      //       1,
      //       "#3BB3C3",
      //       2,
      //       "#669EC4",
      //       3,
      //       "#8B88B6",
      //       4,
      //       "#A2719B",
      //       5,
      //       "#AA5E79"
      //     ],
      //     "circle-opacity": 0.8
      //   }
      // });
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on("mousemove",  e => {
      var casualty = map.queryRenderedFeatures(e.point, {
        layers: [LAYER_TYPE.CONFIRMED, LAYER_TYPE.DEATHS]
        // layers: [LAYER_TYPE.CONFIRMED, LAYER_TYPE.DEATHS, LAYER_TYPE.RECOVERED]
        // layers: [LAYER_TYPE.DEATHS]
      });
      if (casualty.length > 0) {
        var coordinates = casualty[0].geometry.coordinates.slice();
  
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
  
        const { country_region, province_state, confirmed, deaths, Date, active, recovered, change } = casualty[0].properties;
        let html = `<strong>${country_region}</strong><p>province_state: ${province_state}</br>`;
        if (confirmed) html += `Confirmed(cumulative): ${numberWithCommas(confirmed)}</br>`;
        if (recovered) html += `recovered: ${numberWithCommas(recovered)}</br>`;
        if (deaths) html += `Death: ${numberWithCommas(deaths)}</br>`;
        if (change) html += `Change: ${numberWithCommas(change)}</br>`;
        if (active) html += `<hr/>Active: ${numberWithCommas(active)}</br>`;
        
        html += `Date: ${Date} </p>`;
        popup
        .setLngLat(coordinates)
        .setHTML(html)
        .addTo(map);
      } else {
        popup.remove();
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  function handleFilterChange(e) {
    var type = e.target.value;
    setLayer(type);

    for (const property in LAYER_TYPE) {
      if (LAYER_TYPE[property] === type) {
        map.setLayoutProperty(LAYER_TYPE[property], "visibility", "visible");
      } else {
        map.setLayoutProperty(LAYER_TYPE[property], "visibility", "none");
      }
    }
  }

  function handleInputChange(e) {
    var idx = parseInt(e.target.value);
    setDateIndex(idx);
    filterBy(dateRange[idx])
  }

  function filterBy(date) {
    var filters = ['==', 'Date', date];
    // change layer 
    map.setFilter(layer, filters);
    map.setFilter("daily", filters);
  }
 
  const currentDate = dateRange[dateIndex].split("/");
  const thisMonth = currentDate[0]
  const thisDay = currentDate[1]
  return (
    <div style={mapContainerStyle}>
      <div id="map" style={mapStyle} ref={el => (mapContainer.current = el)} />;
      <div id="console" className="header" style={consoleStyle}>
        <span className="title bold">COVID-19 Global Cases</span>{' '}
        <span className="sub-text">(Data sourced from <a target="_blank"  rel="noopener noreferrer" href="https://covid-19.datasettes.com/">Johns Hopkins CSSE)</a></span>{' '}
        <div className="inline">
        <button type="button" className={`button mr-2 click-layer ${layer === LAYER_TYPE.DAILY ? "on" : "" }` } value={LAYER_TYPE.DAILY} onClick={handleFilterChange}>LIVE!</button>
          <button type="button" className={`button mr-2 click-layer ${layer === LAYER_TYPE.CONFIRMED ? "on" : "" }`} value={LAYER_TYPE.CONFIRMED} onClick={handleFilterChange} >{LAYER_TYPE.CONFIRMED.toUpperCase()}</button>
          <button type="button" className={`button mr-2 click-layer ${layer === LAYER_TYPE.DEATHS ? "on" : "" }`} value={LAYER_TYPE.DEATHS} onClick={handleFilterChange} >{LAYER_TYPE.DEATHS.toUpperCase()}</button>
          <button type="button" className="button click-layer">RECOVERED</button>
        </div>
      </div>
      <div id="legend" className="legend" style={legendStyle}>
        <div className="legend-title">CASES</div>
        <div className="legend-list">
          <div className="mb-2"><span className="dot"></span>1~100</div>
          <div className="mb-2"><span className="dot"></span>~50K</div>
          <div className="mb-2"><span className="dot"></span>12.5K</div>
          <div className="mb-2"><span className="dot"></span>~200K</div>
          <div className="mb-2"><span className="dot"></span>~500K</div>
          <div><span className="dot"></span>~800K</div>
        </div>
      </div>
      <div id="input-range" style={inputRangeStyle}>
        <div className="current-date">
          {thisMonth}.{thisDay}
        </div>
        <input
            id="date-slider"
            className="date-slider"
            type="range"
            min="0"
            max={dateRange.length-1}
            step="1"
            value={dateIndex}
            onChange={handleInputChange}
          />
      </div>
    </div>
  );
}

export default Timeseries;
