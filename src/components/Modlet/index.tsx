import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import { Modlet } from "helpers";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

interface ModletProps {
  advancedMode: boolean;
  modlet: Modlet;
}

const useStyles = makeStyles(theme => ({
  root: {
    height: "auto"
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
  }
}));

function ModletComponent(props: ModletProps): React.ReactElement {
  const [enabled, setEnabled] = useState(props.modlet.isEnabled());

  const classes = useStyles();
  const conditions: React.ReactNode[] = [];

  const handleEnableClick = (event: React.ChangeEvent<HTMLInputElement>, modlet: Modlet) => {
    setEnabled(event.target.checked);
    modlet.enable(event.target.checked);
  };

  const modlet = {
    name: props.modlet.get("name"),
    author: props.modlet.get("author"),
    description: props.modlet.get("description"),
    version: props.modlet.get("version"),
    compatibility: props.modlet.get("compat")
  };

  return props.advancedMode ? (
    <TableRow>
      <TableCell>
        <Typography>{modlet.name}</Typography>
        <Typography className={classes.description} variant="body2" color="textSecondary">
          {modlet.description}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography>{modlet.author}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{modlet.version}</Typography>
        <Typography className={classes.italic} variant="body2" color="textSecondary">
          {modlet.compatibility}
        </Typography>
      </TableCell>
      <TableCell>{conditions}</TableCell>
    </TableRow>
  ) : (
    <Card className={classes.root}>
      <CardContent>
        <Typography>{modlet.name}</Typography>
        <Typography className={classes.description} variant="body2" color="textSecondary">
          {modlet.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Typography className={classes.cardVersion} variant="caption" component="div" color="textSecondary">
          By {modlet.author} - v{modlet.version}{" "}
          {modlet.compatibility !== "unknown" && <i> (compatibility: {modlet.compatibility})</i>}
        </Typography>
        <FormControlLabel
          className={classes.enableControl}
          control={<Switch size="small" checked={enabled} onChange={e => handleEnableClick(e, props.modlet)} />}
          label={enabled ? "Enabled" : "Disabled"}
          labelPlacement="start"
        />
      </CardActions>
    </Card>
  );
}

ModletComponent.propTypes = {
  advancedMode: PropTypes.bool.isRequired,
  modlet: PropTypes.instanceOf(Modlet).isRequired
};

export default ModletComponent;
