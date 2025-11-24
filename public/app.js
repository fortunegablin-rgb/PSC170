const API_URL = '/api';

async function addMember(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const contact = document.getElementById('contact').value;
    const initial_payment = document.getElementById('initial_payment').value;

    try {
        const response = await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, contact, initial_payment })
        });
        const data = await response.json();

        if (response.ok) {
            showAlert('success', `Member added! ID: ${data.id}`);
            document.getElementById('addMemberForm').reset();
        } else {
            showAlert('error', data.error);
        }
    } catch (error) {
        showAlert('error', 'Network error');
    }
}

async function recharge(event) {
    event.preventDefault();
    const member_id = document.getElementById('member_id').value;
    const amount = document.getElementById('amount').value;

    try {
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id, amount })
        });
        const data = await response.json();

        if (response.ok) {
            showAlert('success', `Recharge successful! New Balance: ZW$ ${data.new_balance.toFixed(2)}`);
            document.getElementById('rechargeForm').reset();
        } else {
            showAlert('error', data.error);
        }
    } catch (error) {
        showAlert('error', 'Network error');
    }
}

let isProcessingDeduction = false;

async function deductTrip(event) {
    event.preventDefault();

    // Prevent double submission
    if (isProcessingDeduction) {
        showAlert('warning', 'Processing... Please wait.');
        return;
    }

    const member_id = document.getElementById('member_id').value;
    const conductor_id = document.getElementById('conductor_id').value;
    const trip_type = document.getElementById('trip_type').value;
    const submitButton = event.target.querySelector('button[type="submit"]');

    // Disable form and button
    isProcessingDeduction = true;
    submitButton.disabled = true;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Processing...';

    try {
        const response = await fetch(`${API_URL}/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id, conductor_id, trip_type })
        });
        const data = await response.json();

        if (response.ok) {
            let msg = `Trip deducted. New Balance: ZW$ ${data.new_balance.toFixed(2)}`;
            if (data.warning) {
                msg += `<br><strong>${data.warning}</strong>`;
                showAlert('warning', msg);
            } else {
                showAlert('success', msg);
            }
            document.getElementById('member_id').value = ''; // Clear member ID for next scan
            document.getElementById('member_id').focus(); // Focus for next scan
        } else {
            showAlert('error', data.error);
        }
    } catch (error) {
        showAlert('error', 'Network error');
    } finally {
        // Re-enable form after a short delay to prevent accidental double clicks
        setTimeout(() => {
            isProcessingDeduction = false;
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }, 1000);
    }
}

async function loadLogs() {
    const member_id = document.getElementById('search_member_id').value;
    if (!member_id) return;

    try {
        // First get member details
        const memberRes = await fetch(`${API_URL}/members/${member_id}`);
        const member = await memberRes.json();

        if (!memberRes.ok) {
            showAlert('error', member.error);
            document.getElementById('logs-container').style.display = 'none';
            return;
        }

        document.getElementById('member-name').textContent = member.name;
        document.getElementById('member-balance').textContent = `ZW$ ${member.balance.toFixed(2)}`;
        document.getElementById('logs-container').style.display = 'block';
        showAlert('success', 'Member found', 1000); // clear alert quickly

        // Get logs
        const logsRes = await fetch(`${API_URL}/logs/${member_id}`);
        const logs = await logsRes.json();

        const tripsBody = document.getElementById('trips-body');
        tripsBody.innerHTML = '';
        logs.trips.forEach(trip => {
            const row = `<tr>
                <td>${new Date(trip.date).toLocaleString()}</td>
                <td>ZW$ ${trip.amount.toFixed(2)}</td>
                <td>${trip.conductor_id}</td>
            </tr>`;
            tripsBody.innerHTML += row;
        });

        const paymentsBody = document.getElementById('payments-body');
        paymentsBody.innerHTML = '';
        logs.payments.forEach(pay => {
            const row = `<tr>
                <td>${new Date(pay.date).toLocaleString()}</td>
                <td>ZW$ ${pay.amount.toFixed(2)}</td>
                <td>${pay.receipt_number}</td>
            </tr>`;
            paymentsBody.innerHTML += row;
        });

    } catch (error) {
        showAlert('error', 'Network error');
    }
}

function showAlert(type, message, timeout = 5000) {
    const alertBox = document.getElementById('alert-box');
    alertBox.className = `alert ${type}`;
    alertBox.innerHTML = message;
    alertBox.style.display = 'block';

    if (timeout) {
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, timeout);
    }
}

async function loadAllMembers() {
    const tableBody = document.getElementById('members-list');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error-message');

    if (!tableBody) return;

    try {
        const res = await fetch(`${API_URL}/members`);
        const members = await res.json();

        if (res.ok) {
            loadingDiv.style.display = 'none';
            tableBody.innerHTML = '';

            if (members.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No members found.</td></tr>';
                return;
            }

            members.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.id}</td>
                    <td>${member.name}</td>
                    <td>${member.contact || '-'}</td>
                    <td>ZW$ ${member.balance.toFixed(2)}</td>
                    <td>
                        <a href="view_logs.html?id=${member.id}" class="btn-small">View Logs</a>
                        <button onclick="deleteMember(${member.id})" class="btn-small btn-danger">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            throw new Error(members.error || 'Failed to load members');
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        errorDiv.textContent = error.message;
    }
}

let memberToDeleteId = null;

function deleteMember(id) {
    memberToDeleteId = id;
    const modal = document.getElementById('password-modal');
    const input = document.getElementById('admin-password-input');

    // Reset input
    input.value = '';

    // Show modal
    modal.style.display = 'flex';

    // Focus input
    input.focus();
}

function closeModal() {
    document.getElementById('password-modal').style.display = 'none';
    memberToDeleteId = null;
}

async function confirmDelete() {
    if (!memberToDeleteId) return;

    const password = document.getElementById('admin-password-input').value;
    if (!password) {
        alert("Please enter a password");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/members/${memberToDeleteId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_password: password })
        });
        const data = await response.json();

        if (response.ok) {
            alert('Member deleted successfully');
            closeModal();
            loadAllMembers(); // Refresh list
            // Try to refresh stats if function exists
            if (typeof loadDashboardStats === 'function') {
                loadDashboardStats();
            }
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Network error');
    }
}

async function changePassword(event) {
    event.preventDefault();
    const current_password = document.getElementById('current_password').value;
    const new_password = document.getElementById('new_password').value;

    try {
        const response = await fetch(`${API_URL}/settings/password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_password, new_password })
        });
        const data = await response.json();

        if (response.ok) {
            showAlert('success', 'Password updated successfully');
            document.getElementById('changePasswordForm').reset();
        } else {
            showAlert('error', data.error);
        }
    } catch (error) {
        showAlert('error', 'Network error');
    }
}

async function loadDashboardStats() {
    const totalMembersEl = document.getElementById('total-members');
    const totalRevenueEl = document.getElementById('total-revenue');
    const activityListEl = document.getElementById('activity-list');

    if (!totalMembersEl) return;

    try {
        const res = await fetch(`${API_URL}/stats`);
        const stats = await res.json();

        if (res.ok) {
            totalMembersEl.textContent = stats.total_members;
            totalRevenueEl.textContent = `ZW$ ${stats.total_revenue.toFixed(2)}`;

            activityListEl.innerHTML = '';
            if (stats.recent_activity.length === 0) {
                activityListEl.innerHTML = '<tr><td colspan="3">No recent activity.</td></tr>';
            } else {
                stats.recent_activity.forEach(item => {
                    const row = document.createElement('tr');
                    const typeClass = item.type === 'Payment' ? 'text-green' : 'text-blue';
                    row.innerHTML = `
                        <td class="${typeClass}"><strong>${item.type}</strong></td>
                        <td>ZW$ ${item.amount.toFixed(2)}</td>
                        <td>${new Date(item.date).toLocaleTimeString()}</td>
                    `;
                    activityListEl.appendChild(row);
                });
            }
        } else {
            console.error("Failed to load stats:", stats.error);
        }
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
    }
}
