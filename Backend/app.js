require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const { callFunction } = require("./classifyEmail");
const { google } = require("googleapis");
const { exec } = require("child_process");
const bodyParser = require("body-parser");
const base64 = require("base-64");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Load Client ID and Client Secret from environment variables
const ClientID = process.env.CLIENT_ID;
const ClientSecret = process.env.CLIENT_SECRET;

// Create an OAuth2 client with the given credentials
const oauth2Client = new google.auth.OAuth2(
  ClientID,
  ClientSecret,
  "http://localhost:3001/api/emails/gmail"
);

let gmailTokens = null;

// Endpoint to get the Google OAuth authentication URL
app.get("/api/auth/gmail", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://mail.google.com/"],
  });

  res.json({ authUrl });
});

// Function to send an email using Gmail API

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

  // Send the email using Gmail API
  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId: threadId,
    },
  });
  return res.data;
};

// Function to fetch Gmail emails and process them
const getGmailEmails = async () => {
  oauth2Client.setCredentials(gmailTokens);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });


   // Fetch unread primary emails from the inbox
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 1,
    q: "label:inbox is:unread category:primary",
  });
  const messages = response.data.messages;

  // Process each email
  const emailPromises = messages.map(async (message) => {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });

    // Extract headers and email content
    const headers = msg.data.payload.headers;
    const from =
      headers.find((header) => header.name === "From")?.value || "Unknown";
    const to =
      headers.find((header) => header.name === "To")?.value || "Unknown";
    const snippet = msg.data.snippet;
    const messageId =
      headers.find((header) => header.name === "Message-ID")?.value || "";
    const threadId = msg.data.threadId;
    // console.log(to, from);

     // Use Llama AI to generate a response based on the email content
    const responseFromAI = await callFunction(snippet);
    try {

      // Send the generated response email
      const result = await sendEmail(
        from,
        responseFromAI["subject"] + responseFromAI["category"],
        responseFromAI["reply"],
        threadId,
        messageId
      );
      // Mark the email as read
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

// Endpoint to handle OAuth callback and process Gmail emails
app.get("/api/emails/gmail", (req, res) => {
  const code = req.query.code;

  oauth2Client.getToken(code, async (err, tokens) => {
    if (err) {
      console.error("Error getting oAuth tokens:", err);
      return res.status(500).send("Authentication failed");
    }
    oauth2Client.setCredentials(tokens);
    gmailTokens = tokens;

     // Fetch and process emails after authentication
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
