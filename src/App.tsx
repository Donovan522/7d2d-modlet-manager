import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
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
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { hot } from "react-hot-loader";
import theme from "helpers/theme";

const useStyles = makeStyles(() => ({
  mainContainer: {
    marginTop: 10
  },
  noGameFolder: {
    display: "block",
    margin: "auto",
    marginTop: 200
  }
}));

interface AppProps {
  store: any;
}

function App(props: AppProps): React.ReactElement {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  let initialState = () => ({
    advancedMode: !!parseInt(props.store.get("mode")),
    config: props.store.store,
    modlets: []
  });

  const stateReducer = (state: any, action: { type: string; payload?: any }) => {
    switch (action.type) {
      case "setAdvancedMode":
        props.store.set("mode", action.payload ? 1 : 0);

        return {
          ...state,
          advancedMode: action.payload
        };

      case "setGameFolder":
        props.store.set("gameFolder", action.payload);

        return {
          ...state,
          config: { ...props.store.store, gameFolder: action.payload }
        };

      case "setModletFolder":
        props.store.set("modletFolder", action.payload);

        return {
          ...state,
          config: { ...props.store.store, modletFolder: action.payload }
        };

      case "setModlets":
        return {
          ...state,
          modlets: action.payload
        };

      case "addModlet":
        return {
          ...state,
          modlets: [...state.modlets, action.payload]
        };

      case "clearModlets":
        return {
          ...state,
          modlets: []
        };

      default:
        return state;
    }
  };

  const [state, stateDispatch] = useReducer(stateReducer, null, initialState);

  const getFolder = async (title: string) => {
    setLoading(true);

    const dialog = await remote.dialog.showOpenDialog({
      title: title,
      properties: ["openDirectory"]
    });

    setLoading(false);

    if (!dialog.canceled) return dialog.filePaths[0];

    return null;
  };

  const getGameFolder = useCallback(
    (event: React.MouseEvent | null | undefined) => {
      if (event) event.preventDefault();

      getFolder('Please select the "7 Days to Die" game folder').then(newFolder => {
        if (newFolder) {
          stateDispatch({ type: "clearModlets" });
          stateDispatch({ type: "setGameFolder", payload: newFolder });

          if (!state.config.modletFolder)
            stateDispatch({ type: "setModletFolder", payload: path.join(newFolder, "Mods") });
        }
      });
    },
    [state.config.modletFolder]
  );

  const getModletFolder = (event: React.MouseEvent | null | undefined) => {
    if (event) event.preventDefault();

    getFolder('Please Select a valid "7 Days to Die" Modlet Folder').then(newFolder => {
      if (newFolder) {
        stateDispatch({ type: "clearModlets" });
        stateDispatch({ type: "setModletFolder", payload: newFolder });
      }
    });
  };

  const toggleAdvancedMode = () => {
    stateDispatch({ type: "clearModlets" });
    stateDispatch({ type: "setAdvancedMode", payload: !state.advancedMode });
  };

  useEffect(() => {
    if (!state.config.gameFolder) getGameFolder(null);
  }, [state.config.gameFolder, getGameFolder]);

  useEffect(() => {
    if (state.config.mode === undefined) stateDispatch({ type: "setAdvancedMode", payload: false });
  }, [state.config.mode]);

  useEffect(() => {
    if (!loading && !state.config.modletFolder && state.config.gameFolder)
      stateDispatch({ type: "setModletFolder", payload: path.join(state.config.gameFolder, "Mods") });
  }, [loading, state.config.gameFolder, state.config.modletFolder]);
  // Get list of modlets
  useEffect(() => {
    if (!loading && !state.modlets.length && state.config.gameFolder) {
      let newModletList = getModlets(
        state.advancedMode ? state.config.modletFolder : path.join(state.config.gameFolder, "Mods")
      );
      if (newModletList.length) stateDispatch({ type: "setModlets", payload: newModletList });
    }
  }, [loading, state.modlets, state.advancedMode, state.config.modletFolder, state.config.gameFolder]);

  if (!loading && (state === undefined || state.config.gameFolder === undefined)) {
    return (
      <Button variant="contained" color="secondary" onClick={getGameFolder} className={classes.noGameFolder}>
        Please Select the 7 days to die game folder to continue...
      </Button>
    );
  }

  if (loading || !state.config.gameFolder || !state.config.modletFolder)
    return <CircularProgress className={classes.noGameFolder} />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" className={classes.mainContainer}>
        <FormControlLabel
          style={{ marginLeft: "auto" }}
          control={<Switch size="small" checked={state.advancedMode} onChange={toggleAdvancedMode} />}
          label={state.advancedMode ? "Advanced Mode" : "Basic Mode"}
        />
        <List dense={true}>
          <FolderPicker
            advancedMode={state.advancedMode}
            folder={state.config.gameFolder}
            handleClick={getGameFolder}
            label="Game Folder"
            tooltip="Click to select Game Folder"
          />
          <Collapse in={state.advancedMode}>
            <FolderPicker
              advancedMode={state.advancedMode}
              folder={state.config.modletFolder}
              handleClick={getModletFolder}
              label="Modlet Folder"
              tooltip="Click to select Modlet folder"
            />
          </Collapse>
        </List>
        <Modlets state={state} />
      </Container>
    </ThemeProvider>
  );
}

export default hot(module)(App);
