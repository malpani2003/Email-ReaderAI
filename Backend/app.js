require("dotenv").config();
const express = require("express");
const app = express();
const port = 3001;
const { callFunction } = require("./classifyEmail");
const { google } = require("googleapis");
const { exec } = require("child_process");
const bodyParser = require("body-parser");
const base64 = require("base-64");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const open = require('open');
// const msal = require('@azure/msal-node');
// console.log('All Environment Variables:', process.env);

const ClientID = process.env.CLIENT_ID;
const ClientSecret = process.env.CLIENT_SECRET;

// console.log(ClientID,ClientSecret);

const oauth2Client = new google.auth.OAuth2(
  ClientID,
  ClientSecret,
  "http://localhost:3001/api/emails/gmail"
);

let gmailTokens = null;

app.get("/api/auth/gmail", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://mail.google.com/"],
  });

  res.json({ authUrl });
});

// app.get('/api/auth/outlook', (req, res) => {
//   const msalConfig = {
//     auth: {
//       clientId: YOUR_CLIENT_ID,
//       authority: `https://login.microsoftonline.com/YOUR_TENANT_ID`,
//       clientSecret: YOUR_CLIENT_SECRET,
//     },
//   };

//   const cca = new msal.ConfidentialClientApplication(msalConfig);

//   const authUrlParams = {
//     scopes: ["Mail.Read"],
//     redirectUri: YOUR_REDIRECT_URL,
//   };

//   cca.getAuthCodeUrl(authUrlParams).then((authUrl) => {
//     res.json({ authUrl });
//   }).catch((error) => res.status(500).json({ error: error.message }));
// });
const sendEmail = async (to, subject, body, threadId, messageId) => {
  oauth2Client.setCredentials(gmailTokens);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const raw = base64
    .encode(
      `Content-Type: text/plain; charset="UTF-8"\nMIME-Version: 1.0\nContent-Transfer-Encoding: 7bit\nTo: ${to}\nSubject: ${subject}\nIn-Reply-To: ${messageId}\nReferences: ${messageId}\n\n${body}`
    )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  console.log(raw);

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId: threadId,
    },
  });
  return res.data;
};

const getGmailEmails = async () => {
  oauth2Client.setCredentials(gmailTokens);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 1,
    q: "label:inbox is:unread category:primary",
  });
  const messages = response.data.messages;

  const emailPromises = messages.map(async (message) => {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });
    const headers = msg.data.payload.headers;
    const from =
      headers.find((header) => header.name === "From")?.value || "Unknown";
    const to =
      headers.find((header) => header.name === "To")?.value || "Unknown";
    const snippet = msg.data.snippet;
    const messageId =
      headers.find((header) => header.name === "Message-ID")?.value || "";
    const threadId = msg.data.threadId;
    console.log(to, from);
    const responseFromAI = await callFunction(snippet);
    try {
      const result = await sendEmail(
        from,
        responseFromAI["subject"] + responseFromAI["category"],
        responseFromAI["reply"],
        threadId,
        messageId
      );
      await gmail.users.messages.modify({
        userId: 'me',
        id: message.id,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
      return { message: "Email sent successfully", result };
    } catch (error) {
      console.error("Error sending email:", error);
      return "Failed to send email";
    }
  });

  return Promise.all(emailPromises);
};

app.get("/api/emails/gmail", (req, res) => {
  const code = req.query.code;

  oauth2Client.getToken(code, async (err, tokens) => {
    if (err) {
      console.error("Error getting oAuth tokens:", err);
      return res.status(500).send("Authentication failed");
    }
    oauth2Client.setCredentials(tokens);
    gmailTokens = tokens;

    try {
      const emails = await getGmailEmails();
      res.json({ emails });
    } catch (error) {
      console.error("Error fetching Gmail emails:", error);
      res.status(500).send("Failed to fetch Gmail emails");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  exec(
    `start http://localhost:${port}/api/auth/gmail`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Browser opened to http://localhost:${port}/api/auth/gmail`);
    }
  );
});
