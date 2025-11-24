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

async function testDelete() {
    console.log('--- Testing Member Deletion ---');

    // 1. Create a member to delete
    console.log('\n1. Creating dummy member...');
    const createRes = await request({
        hostname: '127.0.0.1', port: 8000, path: '/api/members', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { name: "To Delete", contact: "000", initial_payment: 0 });

    const memberId = createRes.body.id;
    console.log('Created Member ID:', memberId);

    // 2. Try deleting with WRONG password
    console.log('\n2. Attempting delete with WRONG password...');
    const failRes = await request({
        hostname: '127.0.0.1', port: 8000, path: `/api/members/${memberId}`, method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }, { admin_password: "wrong" });
    console.log('Status:', failRes.status);
    console.log('Body:', failRes.body);

    // 3. Try deleting with CORRECT password
    console.log('\n3. Attempting delete with CORRECT password...');
    const successRes = await request({
        hostname: '127.0.0.1', port: 8000, path: `/api/members/${memberId}`, method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }, { admin_password: "admin123" });
    console.log('Status:', successRes.status);
    console.log('Body:', successRes.body);

    if (successRes.status === 200) {
        console.log('\nPASS: Member deletion works correctly.');
    } else {
        console.log('\nFAIL: Member deletion failed.');
    }
}

testDelete();
