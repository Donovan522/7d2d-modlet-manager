import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";
import grey from "@material-ui/core/colors/grey";

export default createMuiTheme({
  palette: {
    primary: {
      main: grey[800]
    },
    secondary: {
      main: red[500]
    },
    background: {
      default: grey[200]
    }
  },
  typography: {
    // htmlFontSize: 16,
    fontSize: 12
  }
});
