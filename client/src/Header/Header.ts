import Renderable from "../Core/Renderable.js";
import store from "../Core/Store.js";

export default class Header extends Renderable {
    constructor() {
        super();
    }

    protected render() {
        let headerEl = document.createElement('div');
        headerEl.classList.add('header');
        headerEl.appendChild(this.renderNav());
        headerEl.appendChild(this.renderUser());

        return headerEl;
    }

    private renderUser() {
        let userEl = document.createElement('div');
        userEl.classList.add('user');

        let isOpen = false;
        let openMenu = () => {
            userEl.setAttribute('data-menu', 'true');
            document.addEventListener('click', closeMenu);
            isOpen = true;
        };
        let closeMenu = () => {
            userEl.setAttribute('data-menu', 'false');
            document.removeEventListener('click', closeMenu);
            isOpen = false;
        };
        userEl.addEventListener('click', (event) => {
            event.stopPropagation();

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        let usernameEl = document.createElement('div');
        usernameEl.classList.add('username');
        usernameEl.textContent = store.username;
        userEl.appendChild(usernameEl);

        let iconEl = document.createElement('div');
        iconEl.classList.add('icon');
        userEl.appendChild(iconEl);

        let menuEl = document.createElement('div');
        menuEl.classList.add('menu');
        userEl.appendChild(menuEl);

        let settingsEl = document.createElement('div');
        settingsEl.textContent = 'Settings';
        menuEl.appendChild(settingsEl);

        let logoutEl = document.createElement('div');
        logoutEl.textContent = 'Log out';
        logoutEl.addEventListener('click', () => {
            this.dispatchEvent('logout');
        });
        menuEl.appendChild(logoutEl);

        return userEl;
    }

    private renderNav() {
        let navEl = document.createElement('div');
        navEl.classList.add('nav');
        
        let homeEl = document.createElement('div');
        homeEl.classList.add('material-symbols-outlined');
        homeEl.setAttribute('data-selected', 'true');
        homeEl.textContent = 'home';
        homeEl.addEventListener('click', () => {
            homeEl.setAttribute('data-selected', 'true');
            profileEl.setAttribute('data-selected', 'false');
            chatEl.setAttribute('data-selected', 'false');
        });
        navEl.appendChild(homeEl);

        let profileEl = document.createElement('div');
        profileEl.classList.add('material-symbols-outlined');
        profileEl.setAttribute('data-selected', 'false');
        profileEl.textContent = 'account_circle';
        profileEl.addEventListener('click', () => {
            profileEl.setAttribute('data-selected', 'true');
            homeEl.setAttribute('data-selected', 'false');
            chatEl.setAttribute('data-selected', 'false');
        });
        navEl.appendChild(profileEl);

        let chatEl = document.createElement('div');
        chatEl.classList.add('material-symbols-outlined');
        chatEl.setAttribute('data-selected', 'false');
        chatEl.textContent = 'chat_bubble';
        chatEl.addEventListener('click', () => {
            chatEl.setAttribute('data-selected', 'true');
            homeEl.setAttribute('data-selected', 'false');
            profileEl.setAttribute('data-selected', 'false');
        });
        navEl.appendChild(chatEl);

        return navEl;
    }
}