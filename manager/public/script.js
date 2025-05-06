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

function configureAgent(agentid, customname, sshusername, sshpassword) {
    fetch('/api/configure-agent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ agentid: agentid, custom_name: customname, ssh_username: sshusername, ssh_password: sshpassword })
    })
        .then(response => {
            if (!response.ok) {
                alert('Failed to configure agent.');
            }
        })
        .catch(err => {
            console.error('Error configuring agent:', err);
            alert('Error configuring agent.');
        });
}

document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('contentIframe');

  window.addEventListener('message', (event) => {
    // Check that the message is from a trusted origin (if needed)
    if (event.origin !== window.location.origin) {
      return;
    }

    const { page, modalid, ssh, agent } = event.data;
    let modal;

    if (page) {
      iframe.src = "/pages/" + page;
    }
    if (modalid) {
        modal = new bootstrap.Modal(document.getElementById(modalid));
        modal.show();
    }
    if (modalid == "configureModal" && agent) {
        document.getElementById("custom-name").value = "";
        document.getElementById("ssh-username").value = "";
        document.getElementById("ssh-password").value = "";
        document.getElementById("configureModalLabel").textContent = "Configure: " + agent.hostname;
        const configurebtn = document.getElementById("configureBtn");

        // Remove old listeners by cloning (super clean)
        const newConfigureBtn = configurebtn.cloneNode(true);
        configurebtn.parentNode.replaceChild(newConfigureBtn, configurebtn);

        newConfigureBtn.addEventListener("click", () => {
            const customname = document.getElementById("custom-name").value;
            const sshusername = document.getElementById("ssh-username").value;
            const sshpassword = document.getElementById("ssh-password").value;
            configureAgent(`${agent.hostname}:${agent.ip}`, customname, sshusername, sshpassword);
            iframe.src = "/pages/discover.html";
            modal.hide();
        });
    }

    if (modalid == "sshModal" && ssh && agent) {
        document.getElementById("sshModalLabel").textContent = "SSH Session: " + agent.ip;
        document.getElementById("sshIframe").src = "/pages/" + ssh;
    }
  });

  // Optional: Load a default page on first load
  iframe.src = '/pages/overview.html';
});