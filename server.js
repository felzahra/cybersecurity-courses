const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ IMPORTANT: Replace this with YOUR Google Client ID (get from step 2 below)
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

// 📋 APPROVED EMAILS - Only these people can access your site
const APPROVED_EMAILS = [
    'youremail@gmail.com',      // Your email
    'friend1@example.com',      // Add approved friends here
    'friend2@example.com'       // Add more as needed
];

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post('/api/verify', async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        return res.status(400).json({ error: 'No credential provided' });
    }
    
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const userEmail = payload.email;
        
        const isAllowed = APPROVED_EMAILS.includes(userEmail);
        
        if (isAllowed) {
            res.json({
                allowed: true,
                user: {
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture
                }
            });
        } else {
            res.json({
                allowed: false,
                message: 'Access denied. You are not authorized.'
            });
        }
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});