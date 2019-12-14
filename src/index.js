import Store from "electron-store";
import unhandled from "electron-unhandled";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

unhandled();

ReactDOM.render(<App config={new Store({ name: "7d2dmm" })} />, document.getElementById("root"));
