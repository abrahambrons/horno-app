import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Sidebar from './Components/Sidebar/Sidebar';
import Stats from './Components/Stats/Stats';

function App() {

  return (
    <Router>
      <Switch>
        <Route path="/">
          <>
          <div className="flex">
            <Sidebar />
            <Stats />
          </div>
          </>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
