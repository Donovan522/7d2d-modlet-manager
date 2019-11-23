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

interface ModletProps {
  advancedMode: boolean;
  modlet: Modlet;
}

function ModletComponent(props: ModletProps): React.ReactElement {
  const conditions: React.ReactNode[] = [];

  const [enabled, setEnabled] = useState(props.modlet.isEnabled());

  const handleEnableClick = (event: React.ChangeEvent<HTMLInputElement>, modlet: Modlet) => {
    setEnabled(event.target.checked);
    modlet.enable(event.target.checked);
  };

  const enableSwitch: React.ReactNode = (
    <FormControlLabel
      style={{ marginLeft: "auto", marginRight: 5 }}
      control={<Switch size="small" checked={enabled} onChange={e => handleEnableClick(e, props.modlet)} />}
      label={enabled ? "Enabled" : "Disabled"}
      labelPlacement="start"
    />
  );

  const compatability = props.modlet.get("compat");

  return props.advancedMode ? (
    <TableRow>
      <TableCell>
        <Typography variant="body1">{props.modlet.get("name")}</Typography>
        <Typography variant="body2" color="textSecondary">
          {props.modlet.get("description")}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body1">{props.modlet.get("version")}</Typography>
        <Typography variant="body2" color="textSecondary">
          {compatability}
        </Typography>
      </TableCell>
      <TableCell>{conditions}</TableCell>
    </TableRow>
  ) : (
    <Card>
      <CardContent>
        <Typography variant="body1">{props.modlet.get("name")}</Typography>
        <Typography variant="body2" color="textSecondary">
          {props.modlet.get("description")}
        </Typography>
        <Typography style={{ paddingTop: 15 }} variant="caption" component="div" color="textSecondary">
          By {props.modlet.get("author")} - v.{props.modlet.get("version")}&nbsp;
          {props.modlet.get("compat") !== "unknown" && <i>(compatible with: {props.modlet.get("compat")})</i>}
        </Typography>
      </CardContent>
      <CardActions>{enableSwitch}</CardActions>
    </Card>
  );
}

ModletComponent.propTypes = {
  advancedMode: PropTypes.bool.isRequired,
  modlet: PropTypes.instanceOf(Modlet).isRequired
};

export default ModletComponent;
