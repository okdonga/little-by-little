// https://docs.mapbox.com/help/tutorials/show-changes-over-time/
import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./Default.css";
import { AMPM, AFFECTED_TYPE, MONTHS, DATES } from "./constant";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_ACCESS_TOKEN;

const mapContainerStyle = {
  position: "relative",
  height: "600px"
};

const mapStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "100%"
};

const consoleStyle = {
  position: "absolute",
  width: "240px",
  margin: "10px",
  padding: "10px 20px",
  backgroundColor: "white"
};

function Timeseries() {
  const mapContainer = useRef();
  const [mapProperty, setMapProperty] = useState({
    lng: -74.0059,
    lat: 40.7128,
    zoom: 3
  });
  // const [time, setTime] = useState({ hour: 12, ampm: AMPM.PM });
  const [month, setMonth] = useState(0)
  const [date, setDate]= useState(0); // DATES.length
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
      map.addSource("corona", {
        type: "geojson",
        data: "./data/03-17-2020.geojson" // replace this with the url of your own geojson
      });

      map.addLayer({
        id: "confirmed",
        type: "circle",
        source: "corona",
        // source: {
        //   type: "geojson",
        //   // data: "./data/collisions1601.geojson" // replace this with the url of your own geojson
        //   data: "./data/03-17-2020.geojson" // replace this with the url of your own geojson
        //   //   type: "csv",
        //   //   data: "./data/time_series_19-covid-Confirmed.csv" // replace this with the url of your own geojson
        // },
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["number", ["get", "Confirmed"]],
            0,
            4,
            5,
            24
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["number", ["get", "Confirmed"]],
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
          //   "circle-opacity": 0.8,
          "circle-opacity": 0.8
        }
      });

      map.addLayer({
        id: "deaths",
        type: "circle",
        source: "corona",
        layout: {
          visibility: "none"
        },
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["number", ["get", "Deaths"]],
            0,
            4,
            5,
            24
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["number", ["get", "Deaths"]],
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

      map.addLayer({
        id: "recovered",
        type: "circle",
        source: "corona",
        layout: {
          visibility: "none"
        },
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["number", ["get", "Recovered"]],
            0,
            4,
            5,
            24
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["number", ["get", "Recovered"]],
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
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on("mousemove",  e => {
      var casualty = map.queryRenderedFeatures(e.point, {
        layers: [AFFECTED_TYPE.CONFIRMED, AFFECTED_TYPE.DEATHS, AFFECTED_TYPE.RECOVERED]
      });

      if (casualty.length > 0) {
        var coordinates = casualty[0].geometry.coordinates.slice();
  
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
  
        const { Country, Confirmed, Deaths, Recovered } = casualty[0].properties;
  
        popup
        .setLngLat(coordinates)
        .setHTML(`<strong>${Country}</strong><p>Confirmed: ${Confirmed}</br>Deaths: ${Deaths}</br>Recovered: ${Recovered}</p>`)
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
    setDate(idx);
    filterBy(DATES[idx])
  }

  function filterBy(date) {
    var filters = ['==', 'Date', date];
    // change layer 
    map.setFilter(affectedType, filters);
  }
 
         
  const { lng, lat, zoom } = mapProperty;

  return (
    <div style={mapContainerStyle}>
      <div id="map" style={mapStyle} ref={el => (mapContainer.current = el)} />;
      <div id="console" style={consoleStyle}>
        <h1>COVID-19 Global Cases</h1>
        <p>
          Data:{" "}
          <a href="https://covid-19.datasettes.com/">Johns Hopkins CSSE</a> from
          Jan 2020
        </p>

        <div className="session">
          <h2>{selectedRegion}</h2>
          {countConfirmed !== null && (<h2>
            <span>Confirmed: </span>{countConfirmed}
          </h2>
          )}
          {countDeaths !== null && (
            <h2>
              <span>Deaths: </span>{countDeaths}
            </h2>
          )}
          {countRecovered !== null && (
            <h2>
              <span>Recovered: </span>{countRecovered}
            </h2>
          )}
          <div className="row colors"></div>
          <div className="row labels">
            <div className="label">0</div>
            <div className="label">1</div>
            <div className="label">2</div>
            <div className="label">3</div>
            <div className="label">4</div>
            <div className="label">5+</div>
          </div>
        </div>
        <div className="session" id="sliderbar">
          <h2>
            Date: {" "}
            <label id="active-hour">
             {DATES[date]}
            </label>
          </h2>
          <input
            id="date-slider"
            className="row"
            type="range"
            min="0"
            max={DATES.length-1}
            step="1"
            value={date}
            onChange={handleInputChange}
          />
        </div>
        <div className="session">
          <h2>Day of the week</h2>
          <div className="row" id="filters">
            <input
              id="confirmed"
              type="radio"
              name="toggle"
              value={AFFECTED_TYPE.CONFIRMED}
              checked={affectedType === AFFECTED_TYPE.CONFIRMED}
              onChange={handleFilterChange}
            />
            <label htmlFor="confirmed">Confirmed</label>
            <input
              id="deaths"
              type="radio"
              name="toggle"
              value={AFFECTED_TYPE.DEATHS}
              checked={affectedType === AFFECTED_TYPE.DEATHS}
              onChange={handleFilterChange}
            />
            <label htmlFor="deaths">Deaths</label>
            <input
              id="recovered"
              type="radio"
              name="toggle"
              value={AFFECTED_TYPE.RECOVERED}
              checked={affectedType === AFFECTED_TYPE.RECOVERED}
              onChange={handleFilterChange}
            />
            <label htmlFor="recovered">Recovered</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timeseries;
