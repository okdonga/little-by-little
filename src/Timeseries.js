// https://docs.mapbox.com/help/tutorials/show-changes-over-time/
import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./Default.css";
import { AMPM, DAY_OF_WEEK } from "./constant";

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
    zoom: 12
  });
  const [time, setTime] = useState({ hour: 12, ampm: AMPM.PM });
  const [map, setMap] = useState(null);
  const [dayOfWeek, setDayOfWeek] = useState(DAY_OF_WEEK.ALL);

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
      map.addLayer({
        id: "collisions",
        type: "circle",
        source: {
          type: "geojson",
          data: "./data/collisions1601.geojson" // replace this with the url of your own geojson
          //   type: "csv",
          //   data: "./data/time_series_19-covid-Confirmed.csv" // replace this with the url of your own geojson
        },
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["number", ["get", "Casualty"]],
            0,
            4,
            5,
            24
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["number", ["get", "Casualty"]],
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
    });

    map.on("move", () => {
      console.log("move");
      setMapProperty({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  function handleFilterChange(e) {
    var day = e.target.value;
    setDayOfWeek(day);
    let filterDay;
    // update the map filter
    if (day === "all") {
      filterDay = ["!=", ["string", ["get", "Day"]], "placeholder"];
    } else if (day === "weekday") {
      filterDay = ["match", ["get", "Day"], ["Sat", "Sun"], false, true];
    } else if (day === "weekend") {
      filterDay = ["match", ["get", "Day"], ["Sat", "Sun"], true, false];
    } else {
      console.log("error");
    }
    map.setFilter("collisions", ["all", filterDay]);
  }

  function handleInputChange(e) {
    var hour = parseInt(e.target.value);

    // update the map
    map.setFilter("collisions", ["==", ["number", ["get", "Hour"]], hour]);

    // converting 0-23 hour to AMPM format
    var ampm = hour >= 12 ? AMPM.PM : AMPM.AM;
    var hour12 = hour % 12;

    // update text in the
    setTime({ hour: hour12, ampm });
  }

  const { lng, lat, zoom } = mapProperty;
  const { hour, ampm } = time;

  return (
    <div style={mapContainerStyle}>
      <div id="map" style={mapStyle} ref={el => (mapContainer.current = el)} />;
      <div id="console" style={consoleStyle}>
        <h1>Motor vehicle collisions</h1>
        <p>
          Data:{" "}
          <a href="https://data.cityofnewyork.us/Public-Safety/NYPD-Motor-Vehicle-Collisions/h9gi-nx95">
            Motor vehicle collision injuries and deaths
          </a>{" "}
          in NYC, Jan 2016
        </p>

        <div className="session">
          <h2>Day of the week</h2>
          <h2>Casualty</h2>
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
            Hour:{" "}
            <label id="active-hour">
              {hour}
              {ampm}
            </label>
          </h2>
          <input
            id="slider"
            className="row"
            type="range"
            min="0"
            max="23"
            step="1"
            value={ampm === AMPM.PM ? hour + 12 : hour}
            onChange={handleInputChange}
          />
        </div>
        <div className="session">
          <h2>Day of the week</h2>
          <div className="row" id="filters">
            <input
              id="all"
              type="radio"
              name="toggle"
              value={DAY_OF_WEEK.ALL}
              checked={dayOfWeek === DAY_OF_WEEK.ALL}
              onChange={handleFilterChange}
            />
            <label htmlFor="all">All</label>
            <input
              id="weekday"
              type="radio"
              name="toggle"
              value={DAY_OF_WEEK.WEEKDAY}
              checked={dayOfWeek === DAY_OF_WEEK.WEEKDAY}
              onChange={handleFilterChange}
            />
            <label htmlFor="weekday">Weekday</label>
            <input
              id="weekend"
              type="radio"
              name="toggle"
              value={DAY_OF_WEEK.WEEKEND}
              checked={dayOfWeek === DAY_OF_WEEK.WEEKEND}
              onChange={handleFilterChange}
            />
            <label htmlFor="weekend">Weekend</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timeseries;
