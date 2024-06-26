import React from 'react';
import './App.css';
import EmailConnect from './components/EmailConnect';
import EmailDashboard from './components/EmailDashboard';

function App() {
  return (
    <div className="App">
      <h1>ReachInbox</h1>
      <EmailConnect />
      <EmailDashboard />
    </div>
  );
}

export default App;
