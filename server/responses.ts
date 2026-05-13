import { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { getSession, getSessionId } from './session';

export const Ok = (response: ServerResponse) => {
    response.writeHead(200, { 'content-type': 'text/plain' });
    response.end();
}
export const BadRequest = (response: ServerResponse) => {
    response.writeHead(400, { 'Content-Type': 'text/plain' });
    response.end('Bad request.');
}
export const Unauthorized = (response: ServerResponse) => {
    response.writeHead(401, { 'content-type': 'text/plain' });
    response.end('Unauthorized.');
}
export const Forbidden = (response: ServerResponse) => {
    response.writeHead(403, { 'content-type': 'text/plain' });
    response.end('Forbidden.');
}
export const NotFound = (response: ServerResponse) => {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('Not found.');
}
export const InternalServerError = (response: ServerResponse) => {
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end('Internal server error.');
}

export const SendIndex = (request: IncomingMessage, response: ServerResponse) => {
    const html = fs.readFileSync(path.join(__dirname, `../dist/index.html`));
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(html.toString().replace("{username}", getSession(getSessionId(request.headers.cookie))?.username));
}
export const SendHTML = (response: ServerResponse, filename: string) => {
    const html = fs.readFileSync(path.join(__dirname, `../dist/${filename}`));
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(html);
}
export const SendJS = (response: ServerResponse, filename: string) => {
    const script = fs.readFileSync(path.join(__dirname, `../dist${filename}`));
    response.writeHead(200, { 'content-type': 'text/javascript' });
    response.end(script);
}
export const SendCSS = (response: ServerResponse, filename: string) => {
    const style = fs.readFileSync(path.join(__dirname, `../dist${filename}`));
    response.writeHead(200, { 'content-type': 'text/css' });
    response.end(style);
}
export const SendJPG = (response: ServerResponse, filename: string) => {
    const image = fs.readFileSync(path.join(__dirname, `../dist${filename}`));
    response.writeHead(200, { 'content-type': 'image/jpg' });
    response.end(image);
}

export const SendJSON = (response: ServerResponse, json: { [key: string]: any }) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify(json));
}