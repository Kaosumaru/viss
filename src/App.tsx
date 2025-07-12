import { useRete } from "rete-react-plugin";
import "./App.css";
import { createEditor } from "./renderer/editor";

function App() {
  const [ref] = useRete(createEditor);

  return (
    <div className="App">
      <div ref={ref} style={{ height: "100vh", width: "100vw" }}></div>
    </div>
  );
}

export default App;
