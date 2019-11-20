"use strict";

const BrowserWindow = require("electron").BrowserWindow;
const app = require("electron").app;
const path = require("path");
const formatUrl = require("url").format;
const windowStateKeeper = require("electron-window-state");
const grey = require("@material-ui/core/colors/grey");

// import { app, BrowserWindow } from "electron";
// import * as path from "path";
// import { format as formatUrl } from "url";
// import windowStateKeeper from "electron-window-state";
// import grey from "@material-ui/core/colors/grey";

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  let state = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  const window = new BrowserWindow({
    title: "7 Days 2 Die Modlet Manager",
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 1000,
    minHeight: 800,
    backgroundColor: grey[300],
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (isDevelopment) {
    // process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
    window.webContents.openDevTools();
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true
      })
    );
  }

  state.manage(window);

  window.on("closed", () => {
    mainWindow = null;
  });

  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
  mainWindow = createMainWindow();
});
