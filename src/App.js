import './App.css';
import Home from './Home.js';
import Similar from './Similar';
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="similar" element={<Similar/>} />
      </Routes>
    </div>
  );
}

export default App;
