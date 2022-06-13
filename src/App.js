import './App.css';
import Home from './Home.js';

function App() {
  return (
    <div className="App">
      <Home/>
      <footer className="api-info">
        <p>This app is using getsongbpm.com and getsongkey.com APIs</p>
      </footer>
    </div>
  );
}

export default App;
