import Comms from "../Core/Comms.js";
import Renderable from "../Core/Renderable.js";
import RTC from "../Core/RTC.js";

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
];

export default class Chat extends Renderable {
    private _comms: Comms;
    private _rtc: RTC;

    private _users: { username: string }[];
    private _usersEl: HTMLDivElement;
    private _messagesEl: HTMLDivElement;

    private _activeUser: string;

    constructor(props: { comms: Comms, rtc: RTC }) {
        super(props);
        this.setUpComms();
    }

    protected init(props: { comms: Comms, rtc: RTC }) {
        this._comms = props.comms;
        this._rtc = props.rtc;
        this._users = [];
    }

    protected render() {
        let chatEl = document.createElement("div");
        chatEl.classList.add("chat");
        chatEl.appendChild(this.renderChatWindow());
        chatEl.appendChild(this.renderChatUsers());

        return chatEl;
    }

    private renderChatWindow() {
        let windowEl = document.createElement('div');
        windowEl.classList.add('window');

        let _messagesEl = document.createElement('div');
        _messagesEl.classList.add('history');
        this._messagesEl = _messagesEl;
        windowEl.appendChild(_messagesEl);

        // let scrollToBottomEl = document.createElement('div');
        // scrollToBottomEl.classList.add('scroll-to-bottom');
        // scrollToBottomEl.textContent = 'You have new messages';
        // _messagesEl.appendChild(scrollToBottomEl);

        let promptEl = document.createElement('div');
        promptEl.classList.add('prompt');
        windowEl.appendChild(promptEl);

        let hasMessage = false;
        let sendMessage = () => {
            if (hasMessage) {
                this.renderMessage(inputEl.value, true);
                this._rtc.sendMessage(this._activeUser, inputEl.value);
                inputEl.value = '';
                hasMessage = false;
            }
        };

        let inputEl = document.createElement('input');
        inputEl.setAttribute('placeholder', 'Type in a message');
        inputEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
        inputEl.addEventListener('input', () => {
            hasMessage = !!inputEl.value;
            buttonEl.toggleAttribute('disabled', !hasMessage);
        });
        promptEl.appendChild(inputEl);

        let buttonEl = document.createElement('button');
        buttonEl.addEventListener('click', sendMessage);
        buttonEl.textContent = 'Send';
        promptEl.appendChild(buttonEl);

        // let offerEl = document.createElement('button');
        // offerEl.addEventListener('click', () => this.rtc(true));
        // offerEl.textContent = 'Offer';
        // promptEl.appendChild(offerEl);

        // let answerEl = document.createElement('button');
        // answerEl.addEventListener('click', () => this.rtc(false));
        // answerEl.textContent = 'Answer';
        // promptEl.appendChild(answerEl);

        return windowEl;
    }

    private renderChatUsers() {
        let usersEl = document.createElement("div");
        usersEl.classList.add("users");
        this._usersEl = usersEl;

        return usersEl;
    }

    private renderMessage(message: string, mine: boolean) {
        let messageEl = document.createElement('div');
        messageEl.classList.add('message');
        messageEl.setAttribute('data-type', mine ? 'mine' : 'their');
        messageEl.textContent = message;

        let scrollToEnd = this._messagesEl.scrollHeight === this._messagesEl.clientHeight + this._messagesEl.scrollTop;
        
        this._messagesEl.appendChild(messageEl);

        if (scrollToEnd) {
            this._messagesEl.scrollTop = this._messagesEl.scrollHeight - this._messagesEl.clientHeight;
        }
    }

    private refreshUsers() {
        while (this._usersEl.lastChild) {
            this._usersEl.lastChild.remove();
        }
    
        this._users.forEach((user) => {
            let userEl = document.createElement("div");
            userEl.classList.add("user");
            userEl.dataset.user = user.username;
            userEl.addEventListener("click", () => {
                this._activeUser = user.username;
                this._rtc.createOffer(user.username);
            });
            this._usersEl.appendChild(userEl);

            let usernameEl = document.createElement("div");
            usernameEl.classList.add("name");
            usernameEl.textContent = user.username;
            userEl.appendChild(usernameEl);
        });
    }

    private async setUpComms() {
        await this._comms.isReady();
        
        this._comms.addEventListener('rtc_users', (_users) => {
            this._users = _users;
            this.refreshUsers();
        });      
        
        this._comms.addEventListener('rtc_offer', ({ username }) => {
            let userEl = this._usersEl.querySelector(`[data-user='${username}']`);
            
            let buttonsEl = document.createElement("div");
            buttonsEl.classList.add("offer");
            userEl?.appendChild(buttonsEl);

            let acceptEl = document.createElement("button");
            acceptEl.classList.add("accept");
            acceptEl.textContent = "Accept";
            acceptEl.addEventListener("click", () => {
                this._activeUser = username;
                this._rtc.acceptOffer(username);
                buttonsEl.remove();
            });
            buttonsEl.appendChild(acceptEl);

            let declineEl = document.createElement("button");
            declineEl.classList.add("decline");
            declineEl.textContent = "Decline";
            declineEl.addEventListener("click", () => {
                this._rtc.declineOffer(username);
                buttonsEl.remove();
            });
            buttonsEl.appendChild(declineEl);
        });

        this._rtc.addEventListener("message", (message) => {
            this.renderMessage(message, false);
        })

        this._comms.send("rtc_users", undefined);
    }
}