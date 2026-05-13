import LogIn from "./LogIn/LogIn.js";
import Main from "./Main/Main.js";
import store from "./Core/Store.js";

document.addEventListener("DOMContentLoaded", async () => {
    store.username = (window as any).viewModel?.username;

    if (store.username) {
        renderMain();
    } else {
        renderLogin();
    }
});

const renderLogin = () => {
    const login = new LogIn();
    
    login.addEventListener('login', async (credentials) => {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (response.ok) {
            store.username = credentials.username;
            document.body.removeChild(login.element);
            renderMain();
        }
    });
    document.body.appendChild(login.element);
}

const renderMain = () => {
    const main = new Main();

    main.addEventListener('logout', async () => {
        const response = await fetch('/logout', { credentials: 'include' });

        if (response.ok) {
            store.username = undefined;
            document.body.removeChild(main.element);
            renderLogin();
        }
    });
    document.body.appendChild(main.element);
};