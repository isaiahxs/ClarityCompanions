import { BrowserRouter as Router } from 'react-router-dom';
import Main from './components/Main/Main.js';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Main />
        </Router>
      </header>
    </div>
  );
}

export default App;
