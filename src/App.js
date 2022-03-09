import './App.css';
import WorldInfoTable from "./components/WorldInfoTable";
import Title from "./components/Title";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App">
      <header className="App-header">
          {/*<Title className="app-title"/>*/}
          <WorldInfoTable className="world-info-table"/>
          {/*<Footer className="app-footer"/>*/}
      </header>
    </div>
  );
}

export default App;
