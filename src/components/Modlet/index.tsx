import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Checkbox from "@material-ui/core/Checkbox";
import { green, red } from "@material-ui/core/colors";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import { remote } from "electron";
import { fileExists, Modlet } from "helpers";
import path from "path";
import PropTypes from "prop-types";
import React, { useState } from "react";

interface ModletProps {
  state: any;
  modlet: Modlet;
}

const useStyles = makeStyles(theme => ({
  root: {
    height: "auto"
  },
  box: {
    display: "flex",
    flexFlow: "column",
    alignContent: "center",
    justifyContent: "center"
  },
  cardVersion: {
    fontStyle: "italic",
    marginRight: "auto",
    paddingLeft: theme.spacing(1)
  },
  enableControl: {
    marginLeft: "auto",
    paddingRight: theme.spacing(1)
  },
  italic: {
    fontStyle: "italic"
  },
  description: {
    paddingTop: theme.spacing(1)
  },
  iconOK: {
    color: green[500]
  },
  iconNotOK: {
    color: red[500]
  },
  checkbox: {
    padding: 0,
    paddingRight: theme.spacing(1)
  }
}));

function ModletComponent(props: ModletProps): React.ReactElement {
  const { modlet, state } = props;

  const modInstallPath = path.join(state.config.gameFolder, "Mods", modlet.modInfo.folder);
  const classes = useStyles();
  const valid = modlet.isValid();

  const checkedOK: React.ReactNode = <CheckCircleIcon className={classes.iconOK} />;
  const checkedFAIL: React.ReactNode = <CancelIcon className={classes.iconNotOK} />;
  const checkedNuetral: React.ReactNode = <RadioButtonUncheckedIcon />;

  const [enabled, setEnabled] = useState(modlet.isEnabled());
  const [installed, setInstalled] = useState(fileExists(modInstallPath));

  const conditions: React.ReactNode[] = [
    <FormControlLabel
      key="status-installed"
      control={
        <Checkbox
          disableRipple
          icon={checkedNuetral}
          checkedIcon={checkedOK}
          checked={installed}
          onChange={e => handleInstallClick(e, modlet)}
          className={classes.checkbox}
        />
      }
      label="Installed"
    />,
    <FormControlLabel
      key="status-enabled"
      control={
        <Checkbox
          disableRipple
          icon={checkedNuetral}
          checkedIcon={checkedOK}
          checked={enabled}
          onChange={e => handleEnableClick(e, modlet)}
          className={classes.checkbox}
        />
      }
      label="Enabled"
    />,
    <FormControlLabel
      key="status-validated"
      control={
        <Checkbox
          disableRipple
          icon={checkedFAIL}
          checkedIcon={checkedOK}
          checked={valid}
          className={classes.checkbox}
        />
      }
      label="Validated"
    />
  ];

  const handleInstallClick = (event: React.ChangeEvent<HTMLInputElement>, modlet: Modlet) => {
    if (!installed) {
      modlet
        .install(modInstallPath)
        .then(() => {
          setInstalled(true);
        })
        .catch(err => {
          setInstalled(false);
          remote.dialog.showErrorBox("Unable to install modlet", err);
        });
    } else {
      remote.dialog.showMessageBox({
        type: "info",
        buttons: ["Ok"],
        message: "Sorry! The uninstall feature has not been implemented yet."
      });
    }
  };

  const handleEnableClick = (event: React.ChangeEvent<HTMLInputElement>, modlet: Modlet) => {
    setEnabled(event.target.checked);
    modlet.enable(event.target.checked);
  };

  const modletData = {
    name: modlet.get("name"),
    author: modlet.get("author"),
    description: modlet.get("description"),
    version: modlet.get("version"),
    compatibility: modlet.get("compat")
  };

  return state.advancedMode ? (
    <TableRow>
      <TableCell>
        <Typography>{modletData.name}</Typography>
        <Typography className={classes.description} variant="body2" color="textSecondary">
          {modletData.description}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography>{modletData.author}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{modletData.version}</Typography>
        <Typography className={classes.italic} variant="body2" color="textSecondary">
          {modletData.compatibility}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Box className={classes.box}>{conditions}</Box>
      </TableCell>
    </TableRow>
  ) : (
    <Card className={classes.root}>
      <CardContent>
        <Typography>{modletData.name}</Typography>
        <Typography className={classes.description} variant="body2" color="textSecondary">
          {modletData.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Typography className={classes.cardVersion} variant="caption" component="div" color="textSecondary">
          By {modletData.author} - v{modletData.version}{" "}
          {modletData.compatibility !== "unknown" && <i> (compatibility: {modletData.compatibility})</i>}
        </Typography>
        <FormControlLabel
          className={classes.enableControl}
          control={<Switch size="small" checked={enabled} onChange={e => handleEnableClick(e, modlet)} />}
          label={enabled ? "Enabled" : "Disabled"}
          labelPlacement="start"
        />
      </CardActions>
    </Card>
  );
}

ModletComponent.propTypes = {
  state: PropTypes.object.isRequired,
  modlet: PropTypes.instanceOf(Modlet).isRequired
};

export default ModletComponent;
