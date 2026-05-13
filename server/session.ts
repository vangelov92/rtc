import fs from 'node:fs';
import path from 'node:path';
import { ISession } from "./interfaces";

const COOKIE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~&%:';
const SESSION_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

export const getActiveUsers = (username?: string) => {
    return Object.values(sessions).reduce((res, session) => {
        if (session.websocket && session.username !== username) {
            res.push({ username: session.username });
        }

        return res;
    }, [] as { [key: string]: string }[]);
}

export const updateClients = () => {
    Object.values(sessions).forEach((session) => {
        if (session.websocket) {
            session.websocket.send(JSON.stringify({ action: "rtc_users", payload: getActiveUsers(session.username) }));
        }
    });
}

/**
 * COOKIES
 */
const createSessionId = (length = 32) => {
    let cookie = '';

    for (let i = 0; i < length; i++) {
        cookie += COOKIE_CHARACTERS[Math.floor(Math.random() * COOKIE_CHARACTERS.length)];
    }

    return cookie;
}

export const getSessionId = (cookies?: string) => {
    let cookieMap = cookies?.split(';').reduce((res: { [key: string]: string }, cookie) => {
        const [name, value] = cookie.split('=');

        if (name && value) {
            res[name.trim()] = value;
        }

        return res;
    }, {});

    return cookieMap ? cookieMap['session'] : undefined;
}

/**
 * SESSIONS
 */
export const getSession = (sessionId?: string) => {
    return sessions[sessionId];
}

export const getSessionByUsername = (username?: string) => {
    return Object.values(sessions).find((session) => {
        return session.username === username;
    });
}

export const createSession = ({ username }: { username: string }) => {
    const sessionId = createSessionId();
    const session: ISession = {
        username: username,
        expires: Date.now() + SESSION_EXPIRATION
    }
    sessions[sessionId] = session;
    preserveSessions();

    return { sessionId, session };
}

export const destroySession = (sessionId: string) => {
    sessions[sessionId].websocket.close();
    delete sessions[sessionId];
    preserveSessions();
}

const preserveSessions = () => {
    fs.writeFileSync(path.join(__dirname, 'sessions.json'), JSON.stringify(Object.entries(sessions).reduce((res, [key, value]) => {
        res[key] = {
            username: value.username,
            expires: value.expires
        };

        return res;
    }, {} as { [key: string]: Partial<ISession> })), { encoding: 'utf-8' });
}

const restoreSessions = () => {
    const now = Date.now();

    return Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname, 'sessions.json'), 'utf-8'))).reduce((result, [key, value]: [string, ISession]) => {
        if (value.expires > now) {
            result[key] = value;
        }

        return result;
    }, {} as { [key: string]: ISession });
}

const cleanupSessions = () => {
    const now = Date.now();
    let deleted = false;

    Object.entries(sessions).forEach(([key, value]) => {
        if (value.expires <= now) {
            delete sessions[key];
            deleted = true;
        }
    });

    if (deleted) {
        preserveSessions();
    }
}

const sessionLoop = () => {
    setTimeout(() => {
        cleanupSessions();
        sessionLoop();
    }, 1000)
}

const sessions = restoreSessions();
sessionLoop();