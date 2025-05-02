const token = localStorage.getItem('token');

if (token) {
    // Verify token with backend
    fetch('/api/verifytoken', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.valid) {
            // Token is valid → maybe redirect to dashboard instead of login?
            // window.location.href = 'dashboard.html';
            console.log('Token is valid. Proceed to login normally or auto-login.');
        } else {
            // Invalid token → remove it and check user existence
            localStorage.removeItem('token');
            checkIfUserExists();
        }
    })
    .catch(err => {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        checkIfUserExists();
    });
} else {
    // No token? Check user existence directly
    checkIfUserExists();
}

// Function to check if user exists (and redirect)
function checkIfUserExists() {
    fetch('/api/userexists')
        .then(response => response.json())
        .then(data => {
            if (!data.userExists) {
                window.location.href = 'register.html';
            } else {
                window.location.href = "login.html";
            }
        })
        .catch(err => {
            console.error('Failed to check user existence:', err);
        });
}

const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('expanded');
});

const profileBtn = document.getElementById("profileButton");
profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html"
});

document.addEventListener('DOMContentLoaded', () => {
  const sidebarLinks = document.querySelectorAll('a[data-page]');
  const iframe = document.getElementById('contentIframe');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      iframe.src = '/pages/' + page;
    });
  });

  // Optional: Load a default page on first load
  iframe.src = '/pages/overview.html';
});

document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('contentIframe');

  window.addEventListener('message', (event) => {
    // Check that the message is from a trusted origin (if needed)
    if (event.origin !== window.location.origin) {
      return;
    }

    const { page } = event.data;

    if (page) {
      iframe.src = '/pages/' + page;
    }
  });

  // Optional: Load a default page on first load
  iframe.src = '/pages/overview.html';
});

