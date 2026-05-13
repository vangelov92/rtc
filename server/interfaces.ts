import { WebSocket } from 'ws';

export interface ISession {
    username: string;
    expires: number;
    websocket?: WebSocket;
}

export interface ILoginCredentials {
    username: string;
    password: string;
}

export interface IWebsocketRequestPayload {
    action: keyof IWebsocketRequest,
    payload: IWebsocketRequest[keyof IWebsocketRequest] 
}

export interface IWebsocketResponsePayload<T extends keyof IWebsocketResponse> {
    action: T,
    payload: IWebsocketResponse[T]
}

export interface IWebsocketRequest {
    rtc_users: void;
    rtc_offer: RTCSessionDescription;
    rtc_answer: RTCSessionDescriptionInit;
    rtc_candidate: RTCIceCandidate; 
}

export interface IWebsocketResponse {
    rtc_users: {
        username: string;
    }[];
    rtc_offer: RTCSessionDescription;
    rtc_answer: RTCSessionDescriptionInit;
    rtc_candidate: RTCIceCandidate; 
}