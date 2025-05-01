// scripts/register.js

document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent form from submitting normally

    // Get the form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmpassword').value;

    // Validate password match
    if (password !== confirmPassword) {
        const toast = new Toast("Could not register", "Passwords do not match!", "red");
        toast.show();
        return;
    }

    // Prepare the registration data
    const userData = {
        username,
        password,
        email: 'user@example.com',  // Optional: Add email field to form if needed
    };

    // Send registration request to the backend
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);  // Show error message from backend
        } else {
            // Registration was successful
            window.location.href = 'login.html';  // Redirect to login page after successful registration
        }
    })
    .catch(err => {
        console.error('Registration failed:', err);
    });
});
