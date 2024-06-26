import React, { useState } from 'react';
import axios from 'axios';

function EmailConnect() {
  const [gmailAuthUrl, setGmailAuthUrl] = useState('');
  const [outlookAuthUrl, setOutlookAuthUrl] = useState('');

  const fetchGmailAuthUrl = async () => {
    const response = await axios.get('http://localhost:3000/api/auth/gmail');
    setGmailAuthUrl(response.data.authUrl);
  };

  const fetchOutlookAuthUrl = async () => {
    const response = await axios.get('http://localhost:3000/api/auth/outlook');
    setOutlookAuthUrl(response.data.authUrl);
  };

  return (
    <div>
      <h2>Connect Your Email</h2>
      <button onClick={fetchGmailAuthUrl}>Connect Gmail</button>
      <button onClick={fetchOutlookAuthUrl}>Connect Outlook</button>

      {gmailAuthUrl && <a href={gmailAuthUrl}>Authenticate Gmail</a>}
      {outlookAuthUrl && <a href={outlookAuthUrl}>Authenticate Outlook</a>}
    </div>
  );
}

export default EmailConnect;
