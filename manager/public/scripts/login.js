// scripts/login.js

document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent form from submitting normally

    // Get the form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Prepare the login data
    const loginData = {
        username,
        password,
    };

    // Send login request to the backend
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);  // Show error message from backend
        } else {
            // Login was successful
            localStorage.setItem('token', data.token);  // Save JWT token in localStorage
            window.location.href = '/';  // Redirect to dashboard or homepage
        }
    })
    .catch(err => {
        console.error('Login failed:', err);
        alert('Login failed, please try again later.');
    });
});
