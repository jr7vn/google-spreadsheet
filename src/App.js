import React from 'react';
import './App.css';

import GoogleSheet from './components/GoogleSheet';

const googleAPIKey = process.env.REACT_APP_GOOGLE_API_KEY;
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

console.log(googleAPIKey, googleClientId);

class App extends React.Component {
  render() {
    return (
      <div className="row">
        <GoogleSheet apiKey={googleAPIKey} clientId={googleClientId} />
      </div>
    );
  }
}

export default App;
