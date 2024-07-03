
const express = require('express');
const bodyParser = require('body-parser');
const { sendFcmMessage } = require('./fcm.js');
const functions = require('firebase-functions');

const app = express();
const port = 3000; // Choose your desired port

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle sending FCM message
app.post('/send-fcm-message', async (req, res) => {
    try {
        const { to, title, body, data } = req.body;

        if (!to || !title || !body) {
            return res.status(400).json({ error: 'Missing required fields (to, title, body)' });
        }

        const message = buildFcmMessage(to, title, body, data);
        sendFcmMessage(message);

        res.status(200).json({ message: 'FCM message sent successfully' });
    } catch (error) {
        console.error('Error sending FCM message:', error);
        res.status(500).json({ error: 'Failed to send FCM message' });
    }
});

// Function to construct FCM message object
function buildFcmMessage(to, title, body, data) {
    const message = buildCommonMessage();
    message.message.token = to; // Assuming 'to' is the device token
    message.message.notification.title = title;
    message.message.notification.body = body;

    if (data) {
        message.message.data = data; // Optional: add custom data payload
    }

    return message;
}

// Replace this function with your existing buildCommonMessage function
function buildCommonMessage() {
    return {
        'message': {
            'notification': {
                'title': 'FCM Notification',
                'body': 'Notification from FCM'
            },
            'apns': {
                'payload': {
                    'aps': {
                        'mutable-content': 1, 
                        'content-available': 1
                    }
                }
            }
        }
    };
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

exports.api = functions.https.onRequest(app);
