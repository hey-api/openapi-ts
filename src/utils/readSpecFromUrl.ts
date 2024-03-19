import http from 'http';
import https from 'https';

/**
 * Download the spec file from a url resource
 * @param url
 * @param protocol
 */
export const readSpecFromUrl = async (url: string, protocol: 'http' | 'https'): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        const cb = (response: http.IncomingMessage) => {
            let body = '';
            response.on('data', chunk => {
                body += chunk;
            });
            response.on('end', () => {
                resolve(body);
            });
            response.on('error', () => {
                reject(`Could not read OpenApi spec: "${url}"`);
            });
        };
        if (protocol === 'http') {
            http.get(url, cb);
        } else if (protocol === 'https') {
            https.get(url, cb);
        }
    });
