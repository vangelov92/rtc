import Component from "./Component.js";

interface IStore {
    username?: string;
}

class Store extends Component {
    private _store: IStore;

    constructor() {
        super();
        this._store = {};
    }

    public get username() {
        return this._store.username;
    }

    public set username(username: string) {
        this._store.username = username;
    }
}

const store = new Store();

export default store;