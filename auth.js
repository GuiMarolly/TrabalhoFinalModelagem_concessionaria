document.addEventListener('DOMContentLoaded', () => {
    const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios')) || [];
    const saveUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));

    if (localStorage.getItem('usuarios') === null) {
        saveUsuarios([]);
    }

    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('reg-nome').value;
        const sobrenome = document.getElementById('reg-sobrenome').value;
        const usuario = document.getElementById('reg-usuario').value;
        const senha = document.getElementById('reg-senha').value;
        
        const usuarios = getUsuarios();
        const userExists = usuarios.some(u => u.usuario === usuario);

        if (userExists) {
            registerMessage.textContent = 'Este nome de usuário já existe. Tente outro.';
            registerMessage.className = 'error-message';
            return;
        }

        const newId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: newId,
            nome: `${nome} ${sobrenome}`,
            usuario: usuario,
            senha: senha,
            saldo: 200000
        };

        usuarios.push(newUser);
        saveUsuarios(usuarios);

        registerMessage.textContent = 'Registro efetuado com sucesso! Você já pode fazer o login.';
        registerMessage.className = 'success-message';
        registerForm.reset();
    });

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuario = document.getElementById('login-usuario').value;
        const senha = document.getElementById('login-senha').value;

        // Adicionada verificação para o usuário ROOT
        if (usuario === 'root' && senha === 'root') {
            window.location.href = 'root.html';
            return;
        }

        if (usuario === 'administrador' && senha === '#.administrador') {
            window.location.href = 'gerente.html';
            return;
        }

        const usuarios = getUsuarios();
        const foundUser = usuarios.find(u => u.usuario === usuario && u.senha === senha);

        if (foundUser) {
            localStorage.setItem('currentUserId', foundUser.id);
            window.location.href = 'index.html';
            return;
        }

        loginError.textContent = 'Usuário ou senha inválidos.';
    });
});