const https = require('https');
const { google } = require('googleapis');

const PROJECT_ID = 'zenith-91ca8';
const HOST = 'fcm.googleapis.com';
const PATH = `/v1/projects/${PROJECT_ID}/messages:send`;
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

// Asynchronous function to send FCM messages
async function sendFcmMessage(fcmMessage) {
    try {
        const accessToken = await getAccessToken();
        const options = {
            hostname: HOST,
            path: PATH,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        };

        return new Promise((resolve, reject) => {
            const request = https.request(options, (resp) => {
                let data = '';
                resp.setEncoding('utf8');
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    console.log('Message sent to Firebase for delivery, response:');
                    console.log(data);
                    if (resp.statusCode >= 200 && resp.statusCode < 300) {
                        resolve(data);
                    } else {
                        reject(new Error(`FCM request failed with status ${resp.statusCode}: ${data}`));
                    }
                });
            });

            request.on('error', (err) => {
                console.error('Unable to send message to Firebase');
                reject(err);
            });

            request.write(JSON.stringify(fcmMessage));
            request.end();
        });
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// Function to get Google OAuth2 access token
function getAccessToken() {
    return new Promise((resolve, reject) => {
        const key = require('./admin.json');
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize((err, tokens) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}

module.exports = {
    sendFcmMessage
};
