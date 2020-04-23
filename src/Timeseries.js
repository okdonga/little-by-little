// https://docs.mapbox.com/help/tutorials/show-changes-over-time/
// https://github.com/CSSEGISandData/COVID-19.git 
import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./Default.css";
import { AFFECTED_TYPE } from "./constant";
import { numberWithCommas } from './util/number';
import { generateDates } from "./util/date";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_ACCESS_TOKEN;

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
  top: "100px",
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
  const [month, setMonth] = useState(0)
  const [dateIndex, setDateIndex]= useState(0); // DATES.length
  const [dateRange, setDateRange] = useState(generateDates('2020-01-29', new Date(), DEFAULT_DATE_FORMAT));
  const [map, setMap] = useState(null);
  // TODO: rename this to layer 
  const [affectedType, setAffectedType] = useState(AFFECTED_TYPE.CONFIRMED);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [countConfirmed, setCountConfirmed] = useState(null);
  const [countDeaths, setCountDeaths] = useState(null);
  const [countRecovered, setCountRecovered] = useState(null);

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
        id: "confirmed",
        type: "circle",
        // source: "corona",
        source: {
          type: "geojson",
          // data: "./data/collisions1601.geojson" // replace this with the url of your own geojson
          data: "./data/time_series_covid19_confirmed_global.geojson", // replace this with the url of your own geojson
          // cluster: true,
          // clusterMaxZoom: 14, // Max zoom to cluster points on
          // clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
          //   type: "csv",
          //   data: "./data/time_series_19-covid-Confirmed.csv" // replace this with the url of your own geojson
        },
        paint: {
          "circle-radius": [
            'interpolate', ['linear'], ["get", "confirmed"],
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
            ["number", ["get", "confirmed"]],
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

      // change layer 
      map.setFilter('confirmed', ['==', 'Date', dateRange[0]]);

      map.addLayer({
        id: "deaths",
        type: "circle",
        source: {
          type: "geojson",
          data: "./data/time_series_covid19_deaths_global.geojson",
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

      map.setFilter('deaths', ['==', 'Date', dateRange[0]]);

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
        layers: [AFFECTED_TYPE.CONFIRMED, AFFECTED_TYPE.DEATHS]
        // layers: [AFFECTED_TYPE.CONFIRMED, AFFECTED_TYPE.DEATHS, AFFECTED_TYPE.RECOVERED]
        // layers: [AFFECTED_TYPE.DEATHS]
      });
      if (casualty.length > 0) {
        var coordinates = casualty[0].geometry.coordinates.slice();
  
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
  
        const { country_region, province_state, confirmed, deaths, Recovered, Date } = casualty[0].properties;
        let html = `<strong>${country_region}</strong><p>province_state: ${province_state}</br>`;
        if (confirmed) html += `Confirmed(cumulative): ${confirmed && numberWithCommas(confirmed)}</br>`;
        if (deaths) html += `Death: ${numberWithCommas(deaths)}</br>`
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
    setAffectedType(type);

    for (const property in AFFECTED_TYPE) {
      if (AFFECTED_TYPE[property] === type) {
        map.setLayoutProperty(AFFECTED_TYPE[property], "visibility", "visible");
      } else {
        map.setLayoutProperty(AFFECTED_TYPE[property], "visibility", "none");
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
    map.setFilter(affectedType, filters);
  }
 
         
  const { lng, lat, zoom } = mapProperty;
  const currentDate = dateRange[dateIndex].split("/");
  const thisMonth = currentDate[0]
  const thisDay = currentDate[1]
  return (
    <div style={mapContainerStyle}>
      <div id="map" style={mapStyle} ref={el => (mapContainer.current = el)} />;
      <div id="console" className="header" style={consoleStyle}>
        <span className="title bold">COVID-19 Global Cases</span>{' '}
        <span className="sub-text">(Data sourced from <a target="_blank" href="https://covid-19.datasettes.com/">Johns Hopkins CSSE)</a></span>{' '}
        <div className="inline">
          <button type="button" className={`button mr-2 click-layer ${affectedType === AFFECTED_TYPE.CONFIRMED ? "on" : "" }`} value={AFFECTED_TYPE.CONFIRMED} onClick={handleFilterChange} >{AFFECTED_TYPE.CONFIRMED.toUpperCase()}</button>
          <button type="button" className={`button mr-2 click-layer ${affectedType === AFFECTED_TYPE.DEATHS ? "on" : "" }`} value={AFFECTED_TYPE.DEATHS} onClick={handleFilterChange} >{AFFECTED_TYPE.DEATHS.toUpperCase()}</button>
          <button type="button" className="button click-layer">RECOVERED</button>
        </div>
      </div>
      <div id="legend" className="legend" style={legendStyle}>
        <div class="legend-title">CASES</div>
        <div class="legend-list">
          <div className="mb-2"><span class="dot"></span>1~100</div>
          <div className="mb-2"><span class="dot"></span>~50K</div>
          <div className="mb-2"><span class="dot"></span>12.5K</div>
          <div className="mb-2"><span class="dot"></span>~200K</div>
          <div className="mb-2"><span class="dot"></span>~500K</div>
          <div><span class="dot"></span>~800K</div>
        </div>
      </div>
      <div id="input-range" style={inputRangeStyle}>
        <div class="current-date">
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
