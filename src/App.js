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
      <div className="footer">
        <p>&copy; 2022 Michał Kowalik</p>
      </div>
    </div>
  );
}

export default App;
