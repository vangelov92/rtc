import { IncomingMessage } from "node:http";

export const getRequestJson = async (request: IncomingMessage) => {
    let promiseResolve: (value: unknown) => void;
    let promiseReject: (reason?: any) => void;

    let promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });

    let data = '';

    request.on('data', (chunk) => {
        data += chunk;
    });

    request.on('end', () => {
        promiseResolve(JSON.parse(data));
    });

    request.on('error', () => {
        promiseReject();
    });

    return promise;
}