document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in-body');

    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
        window.location.href = 'login.html';
        return;
    }
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const currentUser = usuarios.find(u => u.id == currentUserId);
    document.getElementById('user-info').innerHTML = `Bem-vindo, <strong>${currentUser.nome}</strong>! <a href="login.html" id="logout-btn">Sair</a>`;

    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUserId');
        window.location.href = 'login.html';
    });

    const getCarros = () => JSON.parse(localStorage.getItem('carros')) || [];
    const saveCarros = (carros) => localStorage.setItem('carros', JSON.stringify(carros));
    const getPropostas = () => JSON.parse(localStorage.getItem('propostas')) || [];
    const savePropostas = (propostas) => localStorage.setItem('propostas', JSON.stringify(propostas));
    
    // ATUALIZAÇÃO: Dados iniciais incluem 'quantidade'
    if (localStorage.getItem('carros') === null) {
        const sampleCarros = [
            { id: 1, modelo: 'Honda Civic', marca: 'Honda', ano: 2023, preco: 120000, quantidade: 5, imagem: 'https://via.placeholder.com/300x200.png?text=Honda+Civic' },
            { id: 2, modelo: 'Toyota Corolla', marca: 'Toyota', ano: 2023, preco: 130000, quantidade: 3, imagem: 'https://via.placeholder.com/300x200.png?text=Toyota+Corolla' },
            { id: 3, modelo: 'Hyundai Creta', marca: 'Hyundai', ano: 2024, preco: 110000, quantidade: 8, imagem: 'https://via.placeholder.com/300x200.png?text=Hyundai+Creta' },
        ];
        saveCarros(sampleCarros);
    }
    
    const carListElement = document.getElementById('car-list');
    
    function renderCarros() {
        carListElement.innerHTML = '';
        const carros = getCarros();
        carros.forEach(carro => {
            // ATUALIZAÇÃO: Botão é desabilitado se a quantidade for 0
            const isDisponivel = carro.quantidade > 0;
            const card = document.createElement('div');
            card.className = 'car-card';
            card.innerHTML = `
                <img src="${carro.imagem}" alt="${carro.modelo}">
                <h3>${carro.modelo}</h3>
                <p>Marca: ${carro.marca} | Ano: ${carro.ano}</p>
                <p class="price">R$ ${carro.preco.toLocaleString('pt-BR')}</p>
                <p>Em estoque: ${carro.quantidade}</p>
                <button class="buy-btn" data-id="${carro.id}" ${!isDisponivel ? 'disabled' : ''}>
                    ${isDisponivel ? 'Enviar Proposta' : 'Indisponível'}
                </button>
            `;
            carListElement.appendChild(card);
        });
    }

    carListElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            const carroId = parseInt(e.target.dataset.id);
            const carros = getCarros();
            const carroComprado = carros.find(c => c.id === carroId);

            if (confirm(`Deseja enviar uma proposta para o ${carroComprado.modelo}?`)) {
                const propostas = getPropostas();
                const newProposta = {
                    id: propostas.length > 0 ? Math.max(...propostas.map(p => p.id)) + 1 : 1,
                    clienteId: parseInt(currentUserId),
                    carroId: carroComprado.id,
                    carroModelo: carroComprado.modelo,
                    valor: carroComprado.preco,
                    status: 'Pendente'
                };
                propostas.unshift(newProposta);
                savePropostas(propostas);

                // Apenas exibe a proposta. Não mexe no estoque aqui.
                // O estoque só é decrementado na APROVAÇÃO do gerente.
                alert('Proposta enviada com sucesso! O gerente irá analisar e entrar em contato.');
                // Não precisa re-renderizar a loja aqui, pois o estoque não mudou.
            }
        }
    });

    renderCarros();
});