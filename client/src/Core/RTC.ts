import Comms from "./Comms";
import Component from "./Component.js";
import store from "./Store.js";

interface IConnection {
    rtc_connection?: RTCPeerConnection;
    rtc_channel?: RTCDataChannel;
}

interface IConnections {
    [key: string]: IConnection;
}

const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" }
]

export default class RTC extends Component {
    private _comms: Comms;
    private _connections: IConnections;

    constructor(props: { comms: Comms }) {
        super(props);
        this.listenForRTC();
    }

    protected init(props: { comms: Comms }) {
        super.init(props);
        this._comms = props.comms;
        this._connections = {};
    }

    private async listenForRTC() {
        await this._comms.isReady();

        this._comms.addEventListener("rtc_offer", ({ username, offer }) => {
            if (this._connections[username]) {
                return;
            }

            const rtc_connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
            rtc_connection.setRemoteDescription(offer);

            this._connections[username] = { rtc_connection };
        });

        this._comms.addEventListener("rtc_answer", ({ username, answer }) => {
            const rtc_connection = this._connections[username]?.rtc_connection;
            if (!rtc_connection) {
                return;
            }
            
            rtc_connection.setRemoteDescription(answer);
        });

        this._comms.addEventListener("rtc_candidate", ({ username, candidate }) => {
            const rtc_connection = this._connections[username]?.rtc_connection;
            if (!rtc_connection) {
                return;
            }
            
            rtc_connection.addIceCandidate(candidate);
        });
    }

    public async createOffer(username: string) {
        if (this._connections[username]) {
            return;
        }

        await this._comms.isReady();

        const rtc_connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

        rtc_connection.addEventListener("icecandidate", async (event) => {
            if (event.candidate === null) {
                return;
            }

            this._comms.send("rtc_candidate", { username, candidate: event.candidate });
        });
        
        rtc_connection.addEventListener("negotiationneeded", async () => {
            await rtc_connection.setLocalDescription(await rtc_connection.createOffer());

            this._comms.send("rtc_offer", { username, offer: rtc_connection.localDescription });
        });
        
        const rtc_channel = rtc_connection.createDataChannel("rtc");
        rtc_channel.addEventListener("message", (event) => {
            this.dispatchEvent("message", event.data);
        });
        rtc_channel.addEventListener("open", () => {
            // this._connections[username].rtc_channel = rtc_channel;
        });
        rtc_channel.addEventListener("close", () => {
            delete this._connections[username];
        });

        this._connections[username] = {
            rtc_connection,
            rtc_channel
        };
    }

    public async acceptOffer(username: string) {
        const rtc_connection = this._connections[username]?.rtc_connection;
        if (!rtc_connection) {
            return;
        }

        await this._comms.isReady();

        rtc_connection.addEventListener("icecandidate", async (event) => {
            if (event.candidate === null) {
                return;
            }

            this._comms.send("rtc_candidate", { username, candidate: event.candidate });
        });

        rtc_connection.addEventListener("datachannel", (event) => {
            event.channel.addEventListener("message", (event) => {
                this.dispatchEvent("message", event.data);
            });
            event.channel.addEventListener("open", () => {
                this._connections[username].rtc_channel = event.channel;
            });
            event.channel.addEventListener("close", () => {
                delete this._connections[username];
            });
        });

        await rtc_connection.setLocalDescription(await rtc_connection.createAnswer());

        this._comms.send("rtc_answer", { username: username, answer: rtc_connection.localDescription });
    }

    public async declineOffer(username: string) {
        delete this._connections[username];
        this._comms.dispatchEvent("rtc_decline", { username });
    }

    public sendMessage(username: string, message: string) {
        this._connections[username]?.rtc_channel?.send(message);
    }
}