# Gmail Email Processor
This project sets up an server to interact with the Gmail API. It fetches unread primary emails, processes them using a Llama AI function, and sends responses via the Gmail API.
Working Video Link -: 
## Features

- Fetch unread primary emails from Gmail
- Process email content using a Llama AI 
- Send responses to emails using the Gmail API
- Mark emails as read after processing

## Prerequisites

- Node.js installed on your machine
- Google Cloud project with Gmail API enabled
- OAuth 2.0 Client ID and Client Secret

## Installation

1. Clone the repository:

   ```sh
    git clone <repository-url>
    cd Backend
    npm install
    
2. Create a.env file in Backend folder
    ```sh
    OPENAPI_KEY=LL-7r2hIpUovk66kEdUU3NYzyN9zmwrpBwFNohHimqPGWpbQzKfWyYvIU5wFpnmfATK
    CLIENT_ID=413086726551-sl2lmi5fjj450ut5dphv7oh1jsaakide.apps.googleusercontent.com
    CLIENT_SECRET=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
    PORT=3001

3. Start Server
    ```sh
    node app.js


## Endpoints

1. GET /api/auth/gmail: Generates and returns a Google OAuth authentication URL.
2. GET /api/emails/gmail: Handles the OAuth callback, retrieves emails, processes them, and sends responses.


## Functions
1. sendEmail(to, subject, body, threadId, messageId) : Sends an email using the Gmail API.

    - to: Recipient email address
    - subject: Email subject
    - body: Email body content
    - threadId: Gmail thread ID
    - messageId: Gmail message ID

2. getGmailEmails() : Fetches unread emails from the primary inbox, processes them using a custom function, and sends responses.

