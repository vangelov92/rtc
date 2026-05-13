import Component from "./Component.js";

abstract class Renderable extends Component {
    private _element: HTMLElement;

    constructor(props?: any) {
        super(props);
        this._element = this.render();
    }

    public get element() {
        return this._element;
    }

    protected abstract render() : HTMLElement;
}

export default Renderable;