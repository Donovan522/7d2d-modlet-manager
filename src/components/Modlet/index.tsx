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
import fs from "fs";
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

  const modletDir = path.win32.normalize(path.dirname(modlet.modInfo.file));
  const modletInstallPath = path.win32.normalize(path.join(state.config.gameFolder, "Mods", path.basename(modletDir)));
  const modletLocal = modletDir === modletInstallPath;

  const classes = useStyles();
  const valid = modlet.isValid();

  const checkedOK: React.ReactNode = <CheckCircleIcon className={classes.iconOK} />;
  const checkedFAIL: React.ReactNode = <CancelIcon className={classes.iconNotOK} />;
  const checkedNuetral: React.ReactNode = <RadioButtonUncheckedIcon />;

  const [enabled, setEnabled] = useState(modlet.isEnabled());
  const [installed, setInstalled] = useState(fileExists(modletInstallPath));

  const conditions: React.ReactNode[] = [];
  if (!modletLocal)
    conditions.push(
      <FormControlLabel
        key="status-installed"
        control={
          <Checkbox
            disableRipple
            disabled={modletDir === modletInstallPath}
            icon={checkedNuetral}
            checkedIcon={checkedOK}
            checked={installed}
            onChange={e => handleInstallClick(e)}
            className={classes.checkbox}
          />
        }
        label="Installed"
      />
    );

  conditions.push(
    <FormControlLabel
      key="status-enabled"
      control={
        <Checkbox
          disableRipple
          icon={checkedNuetral}
          checkedIcon={checkedOK}
          checked={enabled}
          onChange={e => handleEnableClick(e)}
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
  );

  const errorDialog = (title: string, err: Error) => {
    remote.dialog.showMessageBox({
      type: "error",
      title: title,
      message: err.message
    });
  };

  const handleInstallClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (installed) {
      setInstalled(false);
      try {
        if (modletLocal) throw new Error(`Error: Will not remove original modlet ${modletInstallPath}`);

        if (!fileExists(modletInstallPath) || !fs.statSync(modletInstallPath).isDirectory())
          throw new Error(`Error: ${modlet.modInfo.folder} is not installed`);

        fs.unlinkSync(modletInstallPath);
      } catch (err) {
        setInstalled(true);
        errorDialog("Unable to uninstall modlet", err);
      }
    } else {
      setInstalled(true);
      try {
        if (modletLocal || fileExists(modletInstallPath))
          throw new Error(`Error: ${modletInstallPath} is already installed`);

        fs.promises
          .symlink(modletDir, modletInstallPath, "junction")
          .then(() => setInstalled(true))
          .catch(err => errorDialog("Unable to install modlet", err));
      } catch (err) {
        setInstalled(false);
        errorDialog("Unable to install modlet", err);
      }
    }
  };

  const handleEnableClick = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          control={<Switch size="small" checked={enabled} onChange={e => handleEnableClick(e)} />}
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
