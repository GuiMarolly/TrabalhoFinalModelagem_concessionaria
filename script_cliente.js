document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in-body');

    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
        window.location.href = 'login.html';
        return;
    }
    const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios')) || [];
    const saveUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));
    const getPropostas = () => JSON.parse(localStorage.getItem('propostas')) || [];

    const userInfoDiv = document.getElementById('user-info');
    const currentUser = getUsuarios().find(u => u.id == currentUserId);
    userInfoDiv.innerHTML = `Bem-vindo, <strong>${currentUser.nome}</strong>! <a href="login.html" id="logout-btn">Sair</a>`;

    userInfoDiv.addEventListener('click', (e) => {
        if (e.target.id === 'logout-btn') {
            e.preventDefault();
            localStorage.removeItem('currentUserId');
            window.location.href = 'login.html';
        }
    });
    
    function updateUI() {
        const usuarios = getUsuarios();
        const cliente = usuarios.find(u => u.id == currentUserId);
        if (!cliente) {
            localStorage.removeItem('currentUserId');
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('cliente-nome').textContent = cliente.nome;
        document.getElementById('cliente-saldo').textContent = `R$ ${cliente.saldo.toLocaleString('pt-BR')}`;
        
        const propostas = getPropostas().filter(p => p.clienteId == currentUserId);
        const historyBody = document.getElementById('propostas-history-body');
        historyBody.innerHTML = '';
        propostas.forEach(p => {
            const motivoHtml = p.status === 'Rejeitada' && p.motivoRejeicao
                ? `<span class="rejection-reason">Motivo: ${p.motivoRejeicao}</span>`
                : '';

            historyBody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.carroModelo}</td>
                    <td>R$ ${p.valor.toLocaleString('pt-BR')}</td>
                    <td>
                        <span class="status status-${p.status.toLowerCase()}">${p.status}</span>
                        ${motivoHtml}
                    </td>
                </tr>
            `;
        });
    }

    const formCredito = document.getElementById('add-credito-form');
    formCredito.addEventListener('submit', (e) => {
        e.preventDefault();
        const valor = parseFloat(document.getElementById('credito-valor').value);
        if (valor > 0) {
            const usuarios = getUsuarios();
            const cliente = usuarios.find(u => u.id == currentUserId);
            cliente.saldo += valor;
            saveUsuarios(usuarios);
            alert(`Crédito de R$ ${valor.toLocaleString('pt-BR')} adicionado com sucesso!`);
            formCredito.reset();
            updateUI();
        }
    });

    updateUI();
});