import path from "path";
import { aboutMenuItem } from "electron-util";

const iconPath = path.join("public", "favicon.ico");
console.log("Icon Path:", iconPath);

const template = commands => [
  {
    label: "File",
    submenu: [
      { label: "Choose Game Folder", accelerator: "CmdOrCtrl+Shift+G", click: commands.chooseGameFolder },
      { label: "Choose Modlet Folder", accelerator: "CmdOrCtrl+Shift+M", click: commands.chooseModletFolder },
      { label: "Toggle Mode", accelerator: "CmdOrCtrl+Shift+T", click: commands.toggleMode },
      { type: "separator" },
      { role: "quit" }
    ]
  },
  { role: "editMenu" },
  {
    label: "View",
    submenu: [
      { label: "refresh modlets", accelerator: "CmdOrCtrl+R", click: commands.refreshModlets },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" },
      { type: "separator" },
      { role: "toggledevtools" },
      { role: "forcereload" }
    ]
  },
  { role: "windowMenu" },
  {
    role: "Help",
    submenu: [
      aboutMenuItem({
        icon: iconPath,
        copyright: "Copyright © Donovan C. Young",
        text: "7 Days to Die Modlet Manager"
      }),
      {
        label: "Learn More",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://gitlab.com/dyoung522/7d2d-modlet-manager/wikis/home");
        }
      }
    ]
  }
];

export default template;
