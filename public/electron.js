const { app, BrowserWindow } = require("electron");
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
    // Note to my future self:
    //   `electron-react-devtools` does NOT work, and will cause hangs.
    //   Remove the "%APPDATA%/[project]/DevTools Extension" file to fix.
    // BrowserWindow.addDevToolsExtension(path.join(__dirname, "../node_modules/electron-react-devtools"));
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
