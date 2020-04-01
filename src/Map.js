import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1Ijoib2tkb25nIiwiYSI6ImNrN2JvcHJiODBkYjgzZW1zaGF2ZjVuenIifQ.9XNG94jkM8x0sNWzC8aJvQ";

const mapContainerStyle = {
  position: "relative",
  height: "600px"
};

const mapStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  // height: "600px",
  width: "100%"
};

const sidebarStyle = {
  display: "inline-block",
  position: "absolute",
  top: "0",
  left: "0",
  margin: "12px",
  backgroundColor: "#404040",
  color: "#ffffff",
  zIndex: "1 !important",
  padding: "6px",
  fontWeight: "bold"
};

function Map() {
  const mapContainer = useRef();
  const [mapProperty, setMapProperty] = useState({ lng: 5, lat: 34, zoom: 2 });

  useEffect(() => {
    const { lat, lng, zoom } = mapProperty;
    console.log(mapProperty);
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      // style: "mapbox://styles/mapbox/streets-v8",
      style: "mapbox://styles/okdong/ck7wy98vm0rci1is55mx98fxi",
      // style: "mapbox://styles/okdong/ck7bogbxr0jcw1inv3e9pcv1e",
      center: [lng, lat],
      zoom
    });

    map.on("load", function() {
      map.addLayer({
        id: "historical-places",
        type: "circle",
        source: {
          type: "vectpor",
          url: "mapbox://okdong.431g9ca4"
          // url: "./data/03-17-2020.csv"
        },
        "source-layer": "03-17-2020-34r2vi",
        paint: {
          // "circle-radius": [
          //   "interpolate",
          //   ["linear"],
          //   ["zoom"],
          //   10,
          //   [
          //     "/",
          //     ["-", 2017, ["number", ["get", "Construction_Date"], 2017]],
          //     30
          //   ],
          //   13,
          //   [
          //     "/",
          //     ["-", 2017, ["number", ["get", "Construction_Date"], 2017]],
          //     10
          //   ]
          // ],
          "circle-opacity": 0.8,
          "circle-color": "#ffffff"
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

  const { lng, lat, zoom } = mapProperty;
  return (
    <div style={mapContainerStyle}>
      <div style={sidebarStyle}>
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      </div>
      <div style={mapStyle} ref={el => (mapContainer.current = el)} />;
    </div>
  );
}

export default Map;
