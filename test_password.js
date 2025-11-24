const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        if (data) {
            const dataString = JSON.stringify(data);
            options.headers = options.headers || {};
            options.headers['Content-Length'] = Buffer.byteLength(dataString);

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, body: JSON.parse(body) });
                    } catch (e) {
                        resolve({ status: res.statusCode, body: body });
                    }
                });
            });
            req.on('error', reject);
            req.write(dataString);
            req.end();
        } else {
            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, body: JSON.parse(body) });
                    } catch (e) {
                        resolve({ status: res.statusCode, body: body });
                    }
                });
            });
            req.on('error', reject);
            req.end();
        }
    });
}

async function testPasswordChange() {
    console.log('--- Testing Password Change ---');

    // 1. Try changing with WRONG current password
    console.log('\n1. Attempting change with WRONG current password...');
    const failRes = await request({
        hostname: '127.0.0.1', port: 8000, path: '/api/settings/password', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { current_password: "wrong", new_password: "newpass123" });
    console.log('Status:', failRes.status);
    console.log('Body:', failRes.body);

    // 2. Change with CORRECT current password
    console.log('\n2. Attempting change with CORRECT current password (admin123)...');
    const successRes = await request({
        hostname: '127.0.0.1', port: 8000, path: '/api/settings/password', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { current_password: "admin123", new_password: "newpass123" });
    console.log('Status:', successRes.status);
    console.log('Body:', successRes.body);

    if (successRes.status === 200) {
        console.log('\nPASS: Password changed successfully.');

        // 3. Revert back to admin123 for future tests
        console.log('\n3. Reverting password back to admin123...');
        await request({
            hostname: '127.0.0.1', port: 8000, path: '/api/settings/password', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { current_password: "newpass123", new_password: "admin123" });
    } else {
        console.log('\nFAIL: Password change failed.');
    }
}

testPasswordChange();
