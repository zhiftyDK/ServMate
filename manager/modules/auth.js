// modules/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();
const JWT_SECRET = 'your-secret-key';  // Use env var in production

// Helper to get the single user (returns user object or undefined)
function getUserByUsername(username) {
    return db.prepare('SELECT * FROM user WHERE username = ?').get(username);
}

// REGISTER
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existingUser = getUserByUsername(username);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    try {
        db.prepare('INSERT INTO user (username, passwordHash, email) VALUES (?, ?, ?)')
        .run(username, passwordHash, email);
        res.json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to register user.' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = getUserByUsername(username);
    if (!user) {
        return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful.', token });
});

// CHANGE PASSWORD
router.post('/changepassword', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    const user = getUserByUsername(username);
    if (!user) {
        return res.status(400).json({ error: 'Invalid username.' });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
        return res.status(400).json({ error: 'Old password is incorrect.' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    try {
        db.prepare('UPDATE user SET passwordHash = ? WHERE username = ?')
        .run(newPasswordHash, username);
        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to change password.' });
    }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Expect header: Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;  // Attach user info (e.g., { username })
    next();
  });
}

router.get('/userexists', (req, res) => {
    const user = db.prepare('SELECT * FROM user LIMIT 1').get();
    if (user) {
        res.json({ userExists: true });
    } else {
        res.json({ userExists: false });
    }
});

// VERIFY TOKEN
router.get('/verifytoken', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.json({ valid: false });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.json({ valid: false });
        }
        res.json({ valid: true, user });
    });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
