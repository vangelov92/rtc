import Renderable from "../Core/Renderable.js";

export default class LogIn extends Renderable {
    constructor() {
        super();
    }

    protected render() {
        let loginEl = document.createElement('div');
        loginEl.classList.add('login');
    
        let contentEl = document.createElement('main');
        contentEl.classList.add('content');
        loginEl.appendChild(contentEl);
    
        let cardEl = document.createElement('div');
        cardEl.classList.add('card');
        contentEl.appendChild(cardEl);
    
        let title = document.createElement('label');
        title.classList.add('title');
        title.textContent = 'Lily\'s Knits';
        cardEl.appendChild(title);

        let errorEl = document.createElement('label');
        errorEl.classList.add('error');
        errorEl.textContent = ' ';
        cardEl.appendChild(errorEl);

        const login = () => {
            if (!usernameEl.value.trim()) {
                errorEl.textContent = 'Please enter a username.';
                return false;
            }
    
            if (!passwordEl.value.trim()) {
                errorEl.textContent = 'Please enter a password.';
                return false;
            }

            this.dispatchEvent('login', { username: usernameEl.value, password: passwordEl.value });
        }
    
        let usernameEl = document.createElement('input');
        usernameEl.setAttribute('placeholder', 'Username');
        usernameEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                login();
            }
        });
        cardEl.appendChild(usernameEl);
    
        let passwordEl = document.createElement('input');
        passwordEl.setAttribute('placeholder', 'Password');
        passwordEl.type = 'password';
        passwordEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                login();
            }
        });
        cardEl.appendChild(passwordEl);
    
        let signinEl = document.createElement('button');
        signinEl.textContent = 'Sign in';
        signinEl.addEventListener('click', login);
    
        cardEl.appendChild(signinEl);
    
        let footerEl = document.createElement('footer');
        let legalEl = document.createElement('a');
        legalEl.textContent = 'Legal';
        footerEl.appendChild(legalEl);
    
        loginEl.appendChild(contentEl);
        loginEl.appendChild(footerEl);
    
        return loginEl;
    }
}