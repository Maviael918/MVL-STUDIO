document.addEventListener('DOMContentLoaded', () => {
  // Elementos da UI
  const appContent = document.getElementById('app-content');
  const logoutBtn = document.getElementById('logout-btn');
  const totalPontosSpan = document.getElementById('total-pontos');

  // Contextos dos Gráficos
  const creditsPieCtx = document.getElementById('credits-pie-chart').getContext('2d');
  const balanceLineCtx = document.getElementById('balance-line-chart').getContext('2d');

  let currentUser = null;
  let creditsPieChart, balanceLineChart; // Variáveis para as instâncias dos gráficos

  // --- GERENCIAMENTO DE SESSÃO ---

  // Função principal para verificar a sessão ao carregar a página
  async function checkSessionAndLoad() {
    const { data: { session } } = await supaClient.auth.getSession();

    if (session && session.user) {
      currentUser = session.user;
      appContent.style.display = 'block';
      logoutBtn.style.display = 'block';
      initializeCharts();
      loadUserTransactions();
    } else {
      // Se não houver sessão, redireciona para a página de login
      window.location.href = 'index.html';
    }
  }

  // Monitora mudanças no estado da autenticação (ex: logout)
  supaClient.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      // Se a sessão for encerrada, redireciona para o login
      window.location.href = 'index.html';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await supaClient.auth.signOut();
    // O onAuthStateChange cuidará do redirecionamento
  });

  // --- LÓGICA DO DASHBOARD E GRÁFICOS ---

  function initializeCharts() {
    // Inicializa o gráfico de pizza
    creditsPieChart = new Chart(creditsPieCtx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#27ae60', '#2980b9', '#8e44ad', '#f1c40f', '#e67e22', '#e74c3c'],
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Inicializa o gráfico de linha
    balanceLineChart = new Chart(balanceLineCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Balanço de Créditos',
          data: [],
          borderColor: '#8e44ad',
          tension: 0.1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  async function loadUserTransactions() {
    if (!currentUser) return;

    const { data: transactions, error } = await supaClient
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true }); // Ordena por data para o gráfico de linha

    if (error) {
      console.error('Erro ao carregar transações:', error);
      return;
    }

    updateDashboard(transactions);
  }

  function updateDashboard(transactions) {
    let currentBalance = 0;
    const creditDistribution = {};
    const balanceOverTime = [];
    const labelsOverTime = [];

    transactions.forEach(tx => {
      if (tx.type === 'credit') {
        currentBalance += tx.points;
        // Agrupa créditos por descrição para o gráfico de pizza
        creditDistribution[tx.description] = (creditDistribution[tx.description] || 0) + tx.points;
      } else { // debit
        currentBalance -= tx.points;
      }
      // Adiciona dados para o gráfico de linha
      labelsOverTime.push(new Date(tx.created_at).toLocaleDateString());
      balanceOverTime.push(currentBalance);
    });

    // Atualiza os cards de resumo
    totalPontosSpan.textContent = currentBalance;

    // Atualiza o gráfico de pizza
    creditsPieChart.data.labels = Object.keys(creditDistribution);
    creditsPieChart.data.datasets[0].data = Object.values(creditDistribution);
    creditsPieChart.update();

    // Atualiza o gráfico de linha
    balanceLineChart.data.labels = labelsOverTime;
    balanceLineChart.data.datasets[0].data = balanceOverTime;
    balanceLineChart.update();
  }

  // --- LÓGICA DO MODAL DE CONFIGURAÇÕES ---

  const configModal = document.getElementById('config-modal');
  const configBtn = document.getElementById('config-btn');
  const closeBtn = document.querySelector('.close-btn');

  configBtn.onclick = function() {
    configModal.style.display = 'block';
  }

  closeBtn.onclick = function() {
    configModal.style.display = 'none';
  }

  window.onclick = function(event) {
    if (event.target == configModal) {
      configModal.style.display = 'none';
    }
  }

  function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName === 'Moedas') {
      loadExistingCurrencies();
    } else if (tabName === 'Dividas') {
      loadExistingDebts();
    }
  };

  // Expor a função openTab globalmente para que o HTML possa chamá-la
  window.openTab = openTab;

  // --- LÓGICA PARA GERENCIAR ITENS DO MODAL ---

  const addMoedaBtn = document.getElementById('add-moeda-btn');
  const addDividaBtn = document.getElementById('add-divida-btn');
  const listaMoedasExistentes = document.getElementById('lista-moedas-existentes');
  const listaDividasExistentes = document.getElementById('lista-dividas-existentes');

  // Função para carregar e exibir moedas
  async function loadExistingCurrencies() {
    if (!currentUser) return;

    const { data, error } = await supaClient
      .from('currencies')
      .select('id, name, value')
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Erro ao carregar moedas existentes:', error);
      return;
    }

    listaMoedasExistentes.innerHTML = '';
    data.forEach(currency => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.marginBottom = '8px';
      li.style.padding = '8px';
      li.style.backgroundColor = '#f0f0f0';
      li.style.borderRadius = '5px';

      const textSpan = document.createElement('span');
      textSpan.textContent = `${currency.name} (${currency.value} pontos)`;
      li.appendChild(textSpan);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Excluir';
      deleteButton.style.backgroundColor = '#e74c3c';
      deleteButton.style.color = 'white';
      deleteButton.style.border = 'none';
      deleteButton.style.padding = '5px 10px';
      deleteButton.style.borderRadius = '5px';
      deleteButton.style.cursor = 'pointer';
      deleteButton.onclick = () => deleteCurrency(currency.id);
      li.appendChild(deleteButton);

      listaMoedasExistentes.appendChild(li);
    });
  }

  // Função para carregar e exibir dívidas
  async function loadExistingDebts() {
    if (!currentUser) return;

    const { data, error } = await supaClient
      .from('debts')
      .select('id, name, value')
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Erro ao carregar dívidas existentes:', error);
      return;
    }

    listaDividasExistentes.innerHTML = '';
    data.forEach(debt => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.marginBottom = '8px';
      li.style.padding = '8px';
      li.style.backgroundColor = '#f0f0f0';
      li.style.borderRadius = '5px';

      const textSpan = document.createElement('span');
      textSpan.textContent = `${debt.name} (${debt.value} pontos)`;
      li.appendChild(textSpan);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Excluir';
      deleteButton.style.backgroundColor = '#e74c3c';
      deleteButton.style.color = 'white';
      deleteButton.style.border = 'none';
      deleteButton.style.padding = '5px 10px';
      deleteButton.style.borderRadius = '5px';
      deleteButton.style.cursor = 'pointer';
      deleteButton.onclick = () => deleteDebt(debt.id);
      li.appendChild(deleteButton);

      listaDividasExistentes.appendChild(li);
    });
  }

  // Função para excluir uma moeda
  async function deleteCurrency(id) {
    if (!confirm('Tem certeza que deseja excluir esta moeda?')) return;

    const { error } = await supaClient
      .from('currencies')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id); // Garante que apenas o próprio usuário pode excluir

    if (error) {
      alert(`Erro ao excluir moeda: ${error.message}`);
    } else {
      alert('Moeda excluída com sucesso!');
      loadExistingCurrencies(); // Recarrega a lista
    }
  }

  // Função para excluir uma dívida
  async function deleteDebt(id) {
    if (!confirm('Tem certeza que deseja excluir esta dívida?')) return;

    const { error } = await supaClient
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id); // Garante que apenas o próprio usuário pode excluir

    if (error) {
      alert(`Erro ao excluir dívida: ${error.message}`);
    } else {
      alert('Dívida excluída com sucesso!');
      loadExistingDebts(); // Recarrega a lista
    }
  }

  // Modifica a função openTab para carregar itens quando a aba for ativada
  window.openTab = function(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName === 'Moedas') {
      loadExistingCurrencies();
    } else if (tabName === 'Dividas') {
      loadExistingDebts();
    }
  };

  addMoedaBtn.addEventListener('click', async () => {
    const nome = document.getElementById('moeda-nome').value;
    const valor = parseInt(document.getElementById('moeda-valor').value);
    if (nome && valor) {
      await addItemToTable('currencies', nome, valor);
      document.getElementById('moeda-nome').value = '';
      document.getElementById('moeda-valor').value = '';
      loadExistingCurrencies(); // Recarrega a lista após adicionar
    }
  });

  addDividaBtn.addEventListener('click', async () => {
    const nome = document.getElementById('divida-nome').value;
    const valor = parseInt(document.getElementById('divida-valor').value);
    if (nome && valor) {
      await addItemToTable('debts', nome, valor);
      document.getElementById('divida-nome').value = '';
      document.getElementById('divida-valor').value = '';
      loadExistingDebts(); // Recarrega a lista após adicionar
    }
  });

  async function addItemToTable(tableName, name, value) {
    if (!currentUser) {
      alert('Você precisa estar logado para adicionar itens.');
      return;
    }

    const { data, error } = await supaClient
      .from(tableName)
      .insert([{ user_id: currentUser.id, name: name, value: value }]);

    if (error) {
      alert(`Erro ao adicionar item: ${error.message}`);
    } else {
      alert(`${name} adicionado com sucesso!`);
    }
  }

  // Inicia a verificação da sessão quando o DOM estiver pronto
  checkSessionAndLoad();
});