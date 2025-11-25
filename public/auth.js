// Authentication Helper Functions

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('auth_token');
}

// Get current user role
function getUserRole() {
    return localStorage.getItem('user_role');
}

// Get current username
function getUsername() {
    return localStorage.getItem('username');
}

// Check if user has required role
function hasRole(allowedRoles) {
    const userRole = getUserRole();
    return allowedRoles.includes(userRole);
}

// Require authentication and specific roles
function requireAuth(allowedRoles = ['admin', 'conductor']) {
    if (!isAuthenticated()) {
        // Not logged in - redirect to login
        window.location.href = 'login.html';
        return false;
    }

    if (!hasRole(allowedRoles)) {
        // Logged in but wrong role - redirect to appropriate page
        const userRole = getUserRole();
        if (userRole === 'admin') {
            window.location.href = 'index.html';
        } else {
            window.location.href = 'conductor.html';
        }
        return false;
    }

    return true;
}

// Logout function
function logout() {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');

    // Redirect to login
    window.location.href = 'login.html';
}

// Update navigation based on user role
function updateNavigation() {
    const userRole = getUserRole();
    const username = getUsername();

    if (!userRole) return;

    // Find navigation element
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Role-based navigation items
    const navItems = {
        admin: [
            { href: 'index.html', text: 'Dashboard' },
            { href: 'add_member.html', text: 'Add Member' },
            { href: 'recharge.html', text: 'Recharge' },
            { href: 'conductor.html', text: 'Conductor' },
            { href: 'view_logs.html', text: 'View Logs' },
            { href: 'view_members.html', text: 'View Members' },
            { href: 'settings.html', text: 'Settings' }
        ],
        conductor: [
            { href: 'conductor.html', text: 'Deduct Fare' },
            { href: 'add_member.html', text: 'Add Member' },
            { href: 'view_members.html', text: 'View Members' }
        ]
    };

    // Clear existing navigation
    nav.innerHTML = '';

    // Add role-specific links
    const items = navItems[userRole] || [];
    items.forEach(item => {
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.text;
        nav.appendChild(link);
    });

    // Add user info and logout button
    const userInfo = document.createElement('span');
    userInfo.style.cssText = 'color: white; margin-left: auto; margin-right: 10px;';
    userInfo.textContent = `👤 ${username}`;
    nav.appendChild(userInfo);

    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = 'Logout';
    logoutLink.onclick = (e) => {
        e.preventDefault();
        logout();
    };
    logoutLink.style.cssText = 'background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 5px;';
    nav.appendChild(logoutLink);
}

// Initialize on page load
if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('/login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        updateNavigation();
    });
}
