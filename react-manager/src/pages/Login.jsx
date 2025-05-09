// src/Login.jsx
import { Button, Container, TextField, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServMateLogo from "/images/logo_nobackground.png";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Example login API call
        try {
            const res = await fetch('http://localhost:4500/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                console.log(data);
                alert('Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            alert('Login failed');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, textAlign: "center" }}>
                <img src={ServMateLogo} alt="ServMate Logo" style={{ maxWidth: "300px" }}></img>

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Username"
                        type="text"
                        fullWidth
                        margin="normal"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus="autofocus"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="contained" fullWidth sx={{ mt: 2 }} type="submit">
                        Login
                    </Button>
                </form>
            </Box>
        </Container>
    );
}
