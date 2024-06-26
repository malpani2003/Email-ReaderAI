import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EmailDashboard() {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      const response = await axios.get('/api/emails');
      setEmails(response.data.emails);
    };

    fetchEmails();
  }, []);

  return (
    <div>
      <h2>Email Dashboard</h2>
      <ul>
        {emails.map(email => (
          <li key={email.id}>
            <strong>{email.subject}</strong> - {email.label}
            <p>{email.body}</p>
            <p><em>Reply: {email.reply}</em></p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmailDashboard;
