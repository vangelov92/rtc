import Component from "./Component.js";

interface ISend {
    action: keyof ISendActions,
    payload: ISendActions[keyof ISendActions] 
}

interface IReceive {
    action: keyof IReceiveActions,
    payload: IReceiveActions[keyof IReceiveActions] 
}

interface ISendActions {
    rtc_users: void;
    rtc_request: string;
    rtc_offer: {
        username: string;
        offer: RTCSessionDescription;
    };
    rtc_answer: {
        username: string;
        answer: RTCSessionDescriptionInit;
    }
    rtc_candidate: {
        username: string;
        candidate: RTCIceCandidate;
    };
}

interface IReceiveActions {
    rtc_users: {
        username: string;
    }[];
    rtc_request: string;
    rtc_offer: {
        username: string;
        offer: RTCSessionDescription;
    };
    rtc_answer: {
        username: string;
        answer: RTCSessionDescriptionInit;
    };
    rtc_candidate: {
        username: string;
        candidate: RTCIceCandidate;
    };
}

export default class Comms extends Component {
    private _websocket: WebSocket;
    private _isReady: Promise<void>;

    constructor() {
        super();

        let promiseResolve: Function;
        this._isReady = new Promise((resolve) => {
            promiseResolve = resolve;
        });

        this._websocket = new WebSocket("ws://127.0.0.1:3000/signal");

        this._websocket.addEventListener("open", () => {
            promiseResolve(true);
        });

        this._websocket.addEventListener("message", (event) => {
            const { action, payload } = JSON.parse(event.data) as IReceive;
            this.dispatchEvent(action, payload);
        });
    }

    public send<T extends keyof ISendActions>(action: T, payload: ISendActions[T]) {
        this._websocket.send(JSON.stringify({ action, payload }));
    }

    public addEventListener<T extends keyof IReceiveActions>(event: T, callback: (payload: IReceiveActions[T]) => void): void {
        super.addEventListener(event, callback);
    }

    public async isReady() {
        return await this._isReady;
    }
}