import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null); // null = loading
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        const checkIfUserExists = async () => {
            try {
                const res = await fetch('http://localhost:4500/api/userexists');
                const data = await res.json();
                return data.userExists; // true/false
            } catch (err) {
                console.error('Failed to check user existence:', err);
                return false;
            }
        };

        const verifyToken = async (token) => {
            try {
                const res = await fetch('http://localhost:4500/api/verifytoken', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                const data = await res.json();
                return data.valid; // true/false
            } catch (err) {
                console.error('Token verification failed:', err);
                return false;
            }
        };

        const authenticate = async () => {
            if (token) {
                const valid = await verifyToken(token);
                if (valid) {
                    setIsAuthorized(true);
                } else {
                    localStorage.removeItem('token');
                    const userExists = await checkIfUserExists();
                    if (userExists) {
                        navigate('/login');
                    } else {
                        navigate('/register');
                    }
                }
            } else {
                const userExists = await checkIfUserExists();
                if (userExists) {
                    navigate('/login');
                } else {
                    navigate('/register');
                }
            }
        };

        authenticate();
    }, [navigate]);

    if (isAuthorized === null) return <div>Loading...</div>;

    // Just render children directly
    return children;
}
