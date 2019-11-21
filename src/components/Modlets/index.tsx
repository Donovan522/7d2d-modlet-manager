import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Modlet from "components/Modlet";
import fs from "fs";
import path from "path";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

interface ModletsProps {
  advancedMode: boolean;
  gameFolder: string;
  modletFolder: string;
  modlets: string[];
}

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 20
  },
  card: {
    width: "50%"
  },
  cardEmpty: {
    flex: "1 1 auto",
    color: "silver",
    textAlign: "center",
    marginTop: 50
  },
  noModletsHeader: {
    paddingBottom: 20
  },
  noModletsBody: {
    paddingTop: 10
  },
  button: {
    display: "block",
    margin: "auto",
    marginTop: 30
  }
}));

// apparently "Record" isn't seen by eslint as a part of TypeScript
// eslint-disable-next-line no-undef
const modletsList = (props: ModletsProps, classes: Record<"card", string>) => {
  return props.modlets.map((modletObj: any, index: number) => {
    return (
      <Grid item key={index} className={classes.card}>
        <Modlet modlet={modletObj} advancedMode={props.advancedMode} />
      </Grid>
    );
  });
};

const noModlets = (
  modsPath: string,
  button: React.ReactNode,
  classes: Record<"cardEmpty" | "noModletsHeader" | "noModletsBody", string> // eslint-disable-line no-undef
) => {
  return (
    <Grid item key="no-modlets" className={classes.cardEmpty}>
      <Typography variant="h6" className={classes.noModletsHeader}>
        No Modlets Installed
      </Typography>
      <Divider variant="middle" />
      <Typography variant="body1" className={classes.noModletsBody}>
        To install mods, place them in {modsPath}
        {button}
      </Typography>
    </Grid>
  );
};

const Modlets = (props: ModletsProps) => {
  let modletList: React.ReactNode[] | React.ReactNode;
  const classes = useStyles();
  const modsPath = props.gameFolder ? path.join(props.gameFolder, "Mods") : "";

  const [button, setButton] = useState(<span />);

  modletList = props.modlets.length ? modletsList(props, classes) : noModlets(modsPath, button, classes);

  useEffect(() => {
    const createModsFolder = () => {
      if (!fs.existsSync(modsPath)) {
        fs.mkdirSync(modsPath);
        setButton(<span />);
      }
    };

    if (!button && !fs.existsSync(modsPath)) {
      setButton(
        <Button className={classes.button} onClick={createModsFolder}>
          Create Mods Folder?
        </Button>
      );
    }
  }, [props.gameFolder, button, modsPath, classes.button]);

  return (
    <Grid container spacing={2} className={classes.root}>
      {modletList}
    </Grid>
  );
};

Modlets.prototypes = {
  advancedMode: PropTypes.bool.isRequired,
  gameFolder: PropTypes.string.isRequired,
  modletFolder: PropTypes.string.isRequired,
  modlets: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default Modlets;
