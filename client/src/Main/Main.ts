import Chat from "../Chat/Chat.js";
import Comms from "../Core/Comms.js";
import Renderable from "../Core/Renderable.js";
import RTC from "../Core/RTC.js";
import Header from "../Header/Header.js";

export default class Main extends Renderable {
    private comms: Comms;
    private rtc: RTC;

    constructor() {
        super();
    }

    protected init(): void {
        this.comms = new Comms();
        this.rtc = new RTC({ comms: this.comms });
    }

    protected render() {
        let mainEl = document.createElement('div');
        mainEl.classList.add('main');
        
        let header = new Header();
        header.addEventListener('logout', () => {
            this.dispatchEvent('logout');
        });
        mainEl.appendChild(header.element);

        let chat = new Chat({ comms: this.comms, rtc: this.rtc });
        mainEl.appendChild(chat.element);
    
        return mainEl;
    }
}