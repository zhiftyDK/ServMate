// src/Register.jsx
import { Button, Container, TextField, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServMateLogo from "/images/logo_nobackground.png"

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        // Example register API call
        try {
            const res = await fetch('http://localhost:4500/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (data.error) {
                console.log(data);
                alert('Registration failed');
            } else {
                alert('Registration successful! Please log in.');
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            alert('Registration failed');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, textAlign: "center" }}>
                <img src={ServMateLogo} alt="ServMate Logo" style={{ maxWidth: "300px" }}></img>

                <form onSubmit={handleRegister}>
                    <TextField
                        label="Username"
                        type="text"
                        fullWidth
                        margin="normal"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        Register
                    </Button>
                </form>
            </Box>
        </Container>
    );
}
