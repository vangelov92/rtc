abstract class Component {
    private _eventListeners: { [key: string]: ((payload: any) => void)[] };

    constructor(props?: any) {
        this._eventListeners = {};
        this.init(props);
    }

    protected init(props: any) { }

    public addEventListener(event: string, callback: (payload?: any) => void) {
        if (!this._eventListeners[event]) {
            this._eventListeners[event] = [];
        }

        if (this._eventListeners[event].indexOf(callback) === -1) {
            this._eventListeners[event].push(callback);
        }
    }

    public removeEventListener(event: string, callback: (payload?: any) => void) {
        if (!this._eventListeners[event])
            return;

        const index = this._eventListeners[event].indexOf(callback);

        if (index !== -1) {
            this._eventListeners[event].splice(index, 1);

            if (!this._eventListeners[event].length) {
                delete this._eventListeners[event];
            }
        }
    }

    public dispatchEvent(event: string, payload?: any) {
        if (this._eventListeners[event]) {
            this._eventListeners[event].forEach((callback) => {
                callback(payload);
            });
        }
    }
}

export default Component;