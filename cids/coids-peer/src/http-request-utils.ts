import http from 'http';

export function sendGetRequest(peer: string, path: string) {
    const options = {
        hostname: peer,
        port: 3000,
        path: `/leaderelection/${path}`,
        method: 'GET',
    };

    const http_request = http.request(options, response => {
        console.log(`Status code: ${response.statusCode}`);
    });

    http_request.end();
}

export function sendPostRequest(peer: string, path: string, postData: string) {
    const options = {
        hostname: peer,
        port: 3000,
        path: `/leaderelection/${path}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const http_request = http.request(options, response => {
        console.log(`Status code: ${response.statusCode}`);
    });

    http_request.write(postData);
    http_request.end();
}
