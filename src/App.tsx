import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./App.css";
import { MainView } from "./renderer/mainView";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MainView />
    </ThemeProvider>
  );
}

export default App;
