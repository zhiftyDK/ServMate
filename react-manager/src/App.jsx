import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import ProtectedRoute from './components/ProtectedRoute';
import Overview from "./pages/Overview";
import Login from './pages/Login';
import Signup from './pages/Register';
import Nav from "./components/Nav"

const primaryMain = '#4C89D5';

function App() {
    const [mode, setMode] = useState('dark');  // default theme mode

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
    };

    const theme = useMemo(() => createTheme({
        palette: {
            mode: mode,
            primary: {
                main: primaryMain,
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            button: {
                textTransform: 'none',
            },
        },
    }), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Signup />} />

                    <Route path="/" element={<ProtectedRoute>
                        <Nav toggleTheme={toggleTheme}>

                        </Nav>
                    </ProtectedRoute>}>
                        <Route path="overview" element={<Overview />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
