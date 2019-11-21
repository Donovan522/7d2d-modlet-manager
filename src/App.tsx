import Collapse from "@material-ui/core/Collapse";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import FolderPicker from "components/FolderPicker";
import Modlets from "components/Modlets";
import { remote } from "electron";
import { getModlets } from "helpers";
import path from "path";
import React, { useCallback, useEffect, useState } from "react";
import { hot } from "react-hot-loader";
import theme from "theme";

const useStyles = makeStyles(() => ({
  mainContainer: {
    marginTop: 10
  }
}));

interface AppProps {
  store: any;
}

const App = (props: AppProps) => {
  const classes = useStyles();
  const config = props.store.store;

  const [gameFolder, setGameFolder] = useState("");
  const [modletFolder, setModletFolder] = useState("");
  const [modlets, setModlets] = useState(new Array()); // eslint-disable-line @typescript-eslint/no-array-constructor
  const [advancedMode, setAdvancedMode] = useState(false);

  const getFolder = async (title: string) => {
    const dialog = await remote.dialog.showOpenDialog({
      title: title,
      properties: ["openDirectory"]
    });

    if (!dialog.canceled) return dialog.filePaths[0];
    return null;
  };

  const getGameFolder = useCallback(
    (event: React.MouseEvent | null) => {
      if (event) event.preventDefault();

      getFolder('Please select the "7 Days to Die" game folder').then(newFolder => {
        if (newFolder) {
          setGameFolder(newFolder);
          setModlets([]);
          props.store.set("gameFolder", newFolder);

          if (!modletFolder) setModletFolder(path.join(newFolder, "Mods"));
        }
      });
    },
    [props.store, modletFolder]
  );

  const getModletFolder = useCallback(
    (event: React.MouseEvent | null) => {
      if (event) event.preventDefault();

      getFolder('Please Select a valid "7 Days to Die" Modlet Folder').then(newFolder => {
        if (newFolder) {
          setModletFolder(newFolder);
          setModlets([]);
          props.store.set("modletFolder", newFolder);
        }
      });
    },
    [props.store]
  );

  const toggleAdvancedMode = () => {
    setModlets([]);
    setAdvancedMode(prev => !prev);
  };

  useEffect(() => {
    if (!gameFolder) {
      if (config.gameFolder) {
        setGameFolder(config.gameFolder);
      } else {
        getGameFolder(null);
      }
    }

    // Set the Modlet Directory if it's not already set
    if (!modletFolder) {
      if (config.modletFolder) {
        setModletFolder(config.modletFolder);
      } else {
        if (gameFolder) setModletFolder(path.join(gameFolder, "Mods"));
      }
    }

    // Get list of modlets
    if (modlets && !modlets.length) {
      let newModletList = getModlets(advancedMode ? modletFolder : path.join(gameFolder, "Mods"));
      if (newModletList.length) setModlets(newModletList);
    }
  }, [config.gameFolder, config.modletFolder, gameFolder, modletFolder, modlets, getGameFolder, advancedMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container fixed className={classes.mainContainer}>
        <FormControlLabel
          style={{ marginLeft: "auto" }}
          control={<Switch size="small" checked={advancedMode} onChange={toggleAdvancedMode} />}
          label={advancedMode ? "Advanced Mode" : "Basic Mode"}
        />
        <List dense={true}>
          <FolderPicker
            folder={gameFolder}
            handleClick={getGameFolder}
            label="Game Folder"
            tooltip="Click to select Game Folder"
          />
          <Collapse in={advancedMode}>
            <FolderPicker
              folder={modletFolder}
              handleClick={getModletFolder}
              label="Modlet Folder"
              tooltip="Click to select Modlet folder"
            />
          </Collapse>
        </List>
        <Modlets advancedMode={advancedMode} gameFolder={gameFolder} modletFolder={modletFolder} modlets={modlets} />
      </Container>
    </ThemeProvider>
  );
};

export default hot(module)(App);
