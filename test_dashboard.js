const http = require('http');

function request(path) {
    return new Promise((resolve, reject) => {
        const req = http.get({
            hostname: '127.0.0.1',
            port: 8000,
            path: path
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });
        req.on('error', reject);
    });
}

async function testStats() {
    console.log('Testing /api/stats...');
    try {
        const res = await request('/api/stats');
        console.log('Status:', res.status);
        console.log('Body:', JSON.stringify(res.body, null, 2));

        if (res.status === 200 && res.body.total_members !== undefined) {
            console.log('PASS: Stats endpoint works');
        } else {
            console.log('FAIL: Stats endpoint returned unexpected response');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testStats();
