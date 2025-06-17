document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in-body');

    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'login.html';
    });

    const getPropostas = () => JSON.parse(localStorage.getItem('propostas')) || [];
    const savePropostas = (propostas) => localStorage.setItem('propostas', JSON.stringify(propostas));
    const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios')) || [];
    const saveUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));
    const getCarros = () => JSON.parse(localStorage.getItem('carros')) || [];
    const saveCarros = (carros) => localStorage.setItem('carros', JSON.stringify(carros));
    
    let vendasChart = null;

    function updateDashboard() {
        const todasAsPropostas = getPropostas();
        const usuarios = getUsuarios();
        const carros = getCarros();
        
        const propostasValidas = todasAsPropostas.filter(p => {
            const clienteExiste = usuarios.some(u => u.id === p.clienteId);
            const carroExiste = carros.some(c => c.id === p.carroId);
            return clienteExiste && carroExiste;
        });
        
        const propostasAprovadas = propostasValidas.filter(p => p.status === 'Aprovada');
        
        const totalVendido = propostasAprovadas.reduce((sum, p) => sum + p.valor, 0);
        document.getElementById('total-vendido').textContent = `R$ ${totalVendido.toLocaleString('pt-BR')}`;
        
        document.getElementById('propostas-pendentes').textContent = propostasValidas.filter(p => p.status === 'Pendente').length;
        document.getElementById('carros-vendidos').textContent = propostasAprovadas.length;

        const vendasPorModelo = propostasAprovadas.reduce((acc, p) => {
            acc[p.carroModelo] = (acc[p.carroModelo] || 0) + 1;
            return acc;
        }, {});
        const carroMaisVendido = Object.keys(vendasPorModelo).reduce((a, b) => vendasPorModelo[a] > vendasPorModelo[b] ? a : b, '-');
        document.getElementById('carro-mais-vendido').textContent = carroMaisVendido;
        
        const propostasTableBody = document.getElementById('propostas-table-body');
        propostasTableBody.innerHTML = '';
        propostasValidas.forEach(p => {
            const cliente = usuarios.find(u => u.id === p.clienteId);
            propostasTableBody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${cliente.nome}</td>
                    <td>${p.carroModelo}</td>
                    <td>R$ ${p.valor.toLocaleString('pt-BR')}</td>
                    <td><span class="status status-${p.status.toLowerCase()}">${p.status}</span></td>
                    <td class="action-buttons">
                        ${p.status === 'Pendente' ? `
                            <button class="btn-approve" data-id="${p.id}">Aprovar</button>
                            <button class="btn-reject" data-id="${p.id}">Rejeitar</button>
                        ` : (p.motivoRejeicao ? `Motivo: ${p.motivoRejeicao}` : 'Analisado')}
                    </td>
                </tr>
            `;
        });

        const ctx = document.getElementById('vendas-modelo-chart').getContext('2d');
        if(vendasChart) vendasChart.destroy();
        vendasChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(vendasPorModelo),
                datasets: [{ data: Object.values(vendasPorModelo), backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // CORREÇÃO: Variável da tabela de propostas definida corretamente
    const propostasTableBody = document.getElementById('propostas-table-body');
    propostasTableBody.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (isNaN(id)) return;

        let propostas = getPropostas();
        let proposta = propostas.find(p => p.id === id);
        let carros = getCarros();
        let carro = carros.find(c => c.id === proposta.carroId);
        let usuarios = getUsuarios();
        let cliente = usuarios.find(u => u.id === proposta.clienteId);

        if (!proposta || !carro || !cliente) {
            alert(`Erro: Dados inconsistentes para a proposta ID ${id}.`);
            return;
        }

        if (e.target.classList.contains('btn-approve')) {
            if (cliente.saldo >= proposta.valor) {
                cliente.saldo -= proposta.valor;
                proposta.status = 'Aprovada';
                carro.quantidade -= 1; 
                alert(`Proposta ${id} APROVADA!`);
                saveUsuarios(usuarios);
            } else {
                proposta.status = 'Rejeitada';
                proposta.motivoRejeicao = 'Saldo insuficiente';
                alert(`Proposta ${id} REJEITADA! Saldo insuficiente.`);
            }
            saveCarros(carros);
            savePropostas(propostas);
            updateDashboard();
            renderEstoque();
        }

        if (e.target.classList.contains('btn-reject')) {
            const motivo = prompt(`Motivo da rejeição para a proposta ${id}:`);
            if (motivo === null) return;
            proposta.status = 'Rejeitada';
            proposta.motivoRejeicao = motivo || "Não especificado";
            alert(`Proposta ${id} REJEITADA!`);
            savePropostas(propostas);
            updateDashboard();
        }
    });

    const stockTableBody = document.getElementById('stock-table-body');
    const carForm = document.getElementById('car-form');
    const showFormBtn = document.getElementById('show-add-car-form-btn');
    const cancelFormBtn = document.getElementById('cancel-car-btn');
    const carIdInput = document.getElementById('car-id');
    const saveCarBtn = document.getElementById('save-car-btn');

    function renderEstoque() {
        const carros = getCarros();
        stockTableBody.innerHTML = '';
        carros.forEach(car => {
            stockTableBody.innerHTML += `
                <tr>
                    <td>${car.id}</td>
                    <td>${car.modelo}</td>
                    <td>${car.marca}</td>
                    <td>${car.ano}</td>
                    <td>R$ ${car.preco.toLocaleString('pt-BR')}</td>
                    <td>${car.quantidade}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-id="${car.id}">Editar</button>
                        <button class="btn-remove" data-id="${car.id}">Remover</button>
                    </td>
                </tr>
            `;
        });
    }

    showFormBtn.addEventListener('click', () => {
        carForm.reset();
        carIdInput.value = '';
        saveCarBtn.textContent = 'Adicionar Veículo';
        carForm.classList.remove('hidden');
    });

    cancelFormBtn.addEventListener('click', () => {
        carForm.classList.add('hidden');
    });

    carForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const carros = getCarros();
        const carData = {
            modelo: document.getElementById('car-modelo').value,
            marca: document.getElementById('car-marca').value,
            ano: parseInt(document.getElementById('car-ano').value),
            preco: parseFloat(document.getElementById('car-valor').value),
            quantidade: parseInt(document.getElementById('car-quantidade').value),
            imagem: document.getElementById('car-imagem').value,
        };
        
        const carId = carIdInput.value;
        if (carId) { 
            const carIndex = carros.findIndex(c => c.id == carId);
            carros[carIndex] = { ...carros[carIndex], ...carData };
        } else {
            carData.id = carros.length > 0 ? Math.max(...carros.map(c => c.id)) + 1 : 1;
            // ATENÇÃO: Status não é mais necessário aqui, pois é derivado da quantidade
            carros.push(carData);
        }
        
        saveCarros(carros);
        carForm.classList.add('hidden');
        renderEstoque();
    });

    stockTableBody.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (isNaN(id)) return;

        if (e.target.classList.contains('btn-edit')) {
            const carros = getCarros();
            const carToEdit = carros.find(c => c.id === id);
            
            carIdInput.value = carToEdit.id;
            document.getElementById('car-modelo').value = carToEdit.modelo;
            document.getElementById('car-marca').value = carToEdit.marca;
            document.getElementById('car-ano').value = carToEdit.ano;
            document.getElementById('car-valor').value = carToEdit.preco;
            document.getElementById('car-quantidade').value = carToEdit.quantidade;
            document.getElementById('car-imagem').value = carToEdit.imagem;

            saveCarBtn.textContent = 'Salvar Alterações';
            carForm.classList.remove('hidden');
            window.scrollTo(0, document.body.scrollHeight);
        }

        if (e.target.classList.contains('btn-remove')) {
            if (confirm(`Tem certeza que deseja remover o veículo ID ${id}?`)) {
                let carros = getCarros();
                carros = carros.filter(c => c.id !== id);
                saveCarros(carros);
                renderEstoque();
            }
        }
    });

    updateDashboard();
    renderEstoque();
});