import { ExperienceProvider } from "./context/ExperienceContext";
import { SceneContainer } from "./components/Scene/SceneContainer";
import { Overlay } from "./components/Overlay/Overlay";
import "./App.css";

function App() {
  return (
    <ExperienceProvider>
      <div className="App">
        <Overlay />
        <SceneContainer />
      </div>
    </ExperienceProvider>
  );
}

export default App;
