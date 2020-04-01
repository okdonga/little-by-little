import React from "react";
// import logo from "./logo.svg";
// import "./App.css";
import Map from "./Map";
import Timeseries from "./Timeseries";

function App() {
  return (
    <div className="App">
      <h1>Goal: Show all infected cases in global map</h1>
      <h2>Rank by country</h2>
      <h3>Top 3 most affected</h3>
      <h4>Top 3 Death rate / Infected</h4>
      <Timeseries />
      {/* <Map /> */}

      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
