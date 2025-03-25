import { ReactFlowProvider } from "reactflow";
import Sidebar from "./components/sidebar/Sidebar";
import FlowCanvas from "./components/FlowCanvas";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
