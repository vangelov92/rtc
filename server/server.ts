import http from 'node:http';
import { WebSocket } from 'ws';
import { createSession, destroySession, getActiveUsers, getSession, getSessionByUsername, getSessionId, updateClients } from './session';
import { BadRequest, InternalServerError, Ok, SendCSS, SendHTML, SendIndex, SendJPG, SendJS, Unauthorized } from './responses';
import { getRequestJson } from './requests';
import { ILoginCredentials, IWebsocketRequestPayload } from './interfaces';

const hostname = '127.0.0.1';
const port = 3000;
const websocketServer = new WebSocket.Server({ noServer: true });

websocketServer.on('connection', (websocket, request) => {
    const session = getSession(getSessionId(request.headers.cookie));
    session.websocket = websocket;

    websocket.on('message', (message) => {
        const { action, payload } = JSON.parse(message.toString()) as IWebsocketRequestPayload;

        switch (action) {
            case "rtc_users":
                session.websocket.send(JSON.stringify({ action, payload: getActiveUsers(session.username) }));
                break;
            case "rtc_offer":
                getSessionByUsername((payload as any).username)?.websocket?.send(JSON.stringify({ action, payload: { username: session.username, offer: (payload as any).offer } }));
                break;
            case "rtc_answer":
                getSessionByUsername((payload as any).username)?.websocket?.send(JSON.stringify({ action, payload: { username: session.username, answer: (payload as any).answer } }));
                break;
            case "rtc_candidate":
                getSessionByUsername((payload as any).username)?.websocket?.send(JSON.stringify({ action, payload: { username: session.username, candidate: (payload as any).candidate } }));
                break;
        }
    });

    websocket.on('close', () => {
        session.websocket = undefined;
        updateClients();
    });

    updateClients();
});

const server = http.createServer(async (request, response) => {
    try {
        if (request.url == '/' || request.url?.match(/\.(html|js|css|jpg)/)) {
            if (request.url === '/' || request.url === '/index.html') {
                SendIndex(request, response);
            } else if (request.url.endsWith('html')) {
                SendHTML(response, '/index.html');
            } else if (request.url.endsWith('js')) {
                SendJS(response, request.url);
            } else if (request.url.endsWith('css')) {
                SendCSS(response, request.url);
            } else if (request.url.endsWith('jpg')) {
                SendJPG(response, request.url);
            }
        } else {
            const sessionId = getSessionId(request.headers.cookie);
            const session = getSession(sessionId);

            if (session) {
                if (request.url === "/logout") {
                    destroySession(sessionId);
                    Ok(response);
                } else {
                    Unauthorized(response);
                }
            } else if (request.url === "/login") {
                try {
                    const credentials = await getRequestJson(request) as ILoginCredentials;

                    const { sessionId, session } = createSession({ username: credentials.username });
                    response.writeHead(200, { 'set-cookie': `session=${sessionId}; Max-Age=${(session.expires - Date.now()) / 1000}; HttpOnly; Path=/; SameSite=Strict` });
                    response.end();
                } catch (e) {
                    BadRequest(response);
                }
            } else {
                SendHTML(response, '/index.html');
            }
        }
    } catch (e) {
        InternalServerError(response);
    }
});

server.on('upgrade', (request, socket, head) => {
    if (!getSession(getSessionId(request.headers.cookie))) {
        socket.destroy();
    }

    if (request.url === '/signal') {
        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
            websocketServer.emit('connection', websocket, request);
        });
    } else {
        socket.destroy();
    }
});

server.listen(port, hostname, () => {
    console.log(`Server started at http://${hostname}:${port}!`);
});