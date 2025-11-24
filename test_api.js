const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    console.error(`Failed to parse JSON. Status: ${res.statusCode}`);
                    console.error('Raw Body:', body);
                    resolve({ status: res.statusCode, body: null }); // Resolve with null body instead of rejecting
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log('--- Starting API Tests ---');

    // 1. Add Member
    console.log('\n1. Testing Add Member...');
    const memberData = { name: "Test User", contact: "123456789", initial_payment: 20.00 };
    const memberRes = await request({
        hostname: '127.0.0.1', port: 8000, path: '/api/members', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, memberData);
    console.log('Response:', memberRes.body);
    if (!memberRes.body || !memberRes.body.id) {
        console.error('Failed to create member. Aborting tests.');
        return;
    }
    const memberId = memberRes.body.id;

    // 2. Recharge
    console.log('\n2. Testing Recharge...');
    const rechargeRes = await request({
        hostname: '127.0.0.1', port: 8000, path: '/api/payments', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { member_id: memberId, amount: 10.00 });
    console.log('Response:', rechargeRes.body);

    // 3. Deduct Trip (One-Way)
    console.log('\n3. Testing Deduct Trip (One-Way)...');
    const tripRes = await request({
        hostname: '127.0.0.1', port: 8000, path: '/api/trips', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { member_id: memberId, conductor_id: "COND-001", trip_type: "one-way" });
    console.log('Response:', tripRes.body);

    // 4. Deduct Trip (Two-Way)
    console.log('\n4. Testing Deduct Trip (Two-Way)...');
    const tripRes2 = await request({
        hostname: '127.0.0.1', port: 8000, path: '/api/trips', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { member_id: memberId, conductor_id: "COND-001", trip_type: "two-way" });
    console.log('Response:', tripRes2.body);

    // 5. View Logs
    console.log('\n5. Testing View Logs...');
    const logsRes = await request({
        hostname: '127.0.0.1', port: 8000, path: `/api/logs/${memberId}`, method: 'GET'
    });
    console.log('Logs retrieved. Payments:', logsRes.body.payments.length, 'Trips:', logsRes.body.trips.length);

    console.log('\n--- Tests Completed ---');
}

// Wait for server to start
setTimeout(runTests, 2000);
