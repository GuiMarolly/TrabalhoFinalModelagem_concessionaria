document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in-body');

    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'login.html';
    });

    const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios')) || [];
    const saveUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    const userListBody = document.getElementById('user-list-body');

    function renderUsers() {
        const usuarios = getUsuarios();
        userListBody.innerHTML = '';

        if (usuarios.length === 0) {
            userListBody.innerHTML = '<tr><td colspan="5">Nenhum cliente registrado.</td></tr>';
            return;
        }

        usuarios.forEach(user => {
            const userRow = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.nome}</td>
                    <td>${user.usuario}</td>
                    <td>${user.saldo.toLocaleString('pt-BR')}</td>
                    <td class="action-buttons">
                        <button class="btn-remove" data-id="${user.id}">Remover</button>
                    </td>
                </tr>
            `;
            userListBody.innerHTML += userRow;
        });
    }

    userListBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const userIdToRemove = parseInt(e.target.dataset.id);
            const usuarios = getUsuarios();
            const userToRemove = usuarios.find(u => u.id === userIdToRemove);
            
            if (userToRemove && confirm(`Tem certeza que deseja remover o usuário "${userToRemove.nome}"? Esta ação não pode ser desfeita.`)) {
                const updatedUsers = usuarios.filter(u => u.id !== userIdToRemove);
                saveUsuarios(updatedUsers);
                alert('Usuário removido com sucesso!');
                renderUsers();
            }
        }
    });

    renderUsers();
});