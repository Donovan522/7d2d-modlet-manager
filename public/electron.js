const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const grey = require("@material-ui/core/colors/grey");
const path = require("path");
const isDev = require("electron-is-dev");
const windowStateKeeper = require("electron-window-state");
const unhandled = require("electron-unhandled");

unhandled();

let mainWindow;

function createWindow() {
  let state = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 768
  });

  mainWindow = new BrowserWindow({
    title: "7 Days 2 Die Modlet Manager",
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: grey[300],
    useContentSize: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  state.manage(mainWindow);

  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);
  if (isDev) {
    delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
