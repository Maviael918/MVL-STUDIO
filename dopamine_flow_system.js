document.addEventListener('DOMContentLoaded', () => {
  // Elementos da UI de Autenticação
  const authSection = document.getElementById('auth-section');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // Elementos da UI do Aplicativo
  const appContent = document.getElementById('app-content');
  const listaAcoes = document.getElementById('lista-acoes');
  const totalPontosSpan = document.getElementById('total-pontos');
  const totalDividaSpan = document.getElementById('total-divida');

  // Botões de Ação
  const btnAdicionar = document.getElementById('adicionar');
  const btnAdicionarInfracao = document.getElementById('adicionar-infracao');
  const btnPagarDivida = document.getElementById('pagar-divida');

  // Inputs
  const inputDescricao = document.getElementById('descricao');
  const inputPontos = document.getElementById('pontos');
  const inputDescricaoInfracao = document.getElementById('descricao-infracao');
  const inputPontosInfracao = document.getElementById('pontos-infracao');

  let currentUser = null;

  // --- GERENCIAMENTO DE AUTENTICAÇÃO ---

  // Função para lidar com o cadastro de novos usuários
  signupBtn.addEventListener('click', async () => {
    const { data, error } = await supaClient.auth.signUp({
      email: emailInput.value,
      password: passwordInput.value,
    });
    if (error) {
      alert(`Erro ao cadastrar: ${error.message}`);
    } else {
      alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
    }
  });

  // Função para lidar com o login
  loginBtn.addEventListener('click', async () => {
    const { data, error } = await supaClient.auth.signInWithPassword({
      email: emailInput.value,
      password: passwordInput.value,
    });
    if (error) {
      alert(`Erro no login: ${error.message}`);
    } else {
      // O login foi bem-sucedido, a sessão será detectada pelo onAuthStateChange
    }
  });

  // Função para lidar com o logout
  logoutBtn.addEventListener('click', async () => {
    await supaClient.auth.signOut();
  });

  // Monitora o estado da autenticação (login, logout)
  supaClient.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      currentUser = session.user;
      authSection.style.display = 'none';
      appContent.style.display = 'block';
      logoutBtn.style.display = 'block';
      loadUserTransactions();
    } else {
      currentUser = null;
      authSection.style.display = 'block';
      appContent.style.display = 'none';
      logoutBtn.style.display = 'none';
      listaAcoes.innerHTML = ''; // Limpa a lista ao sair
    }
  });

  // --- LÓGICA DO APLICATIVO ---

  // Carrega as transações do usuário logado
  async function loadUserTransactions() {
    if (!currentUser) return;

    const { data: transactions, error } = await supaClient
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar transações:', error);
      return;
    }

    // Limpa a lista antes de recarregar
    listaAcoes.innerHTML = '';
    let totalPontos = 0;
    let totalDivida = 0;

    transactions.forEach(tx => {
      const li = document.createElement('li');
      if (tx.type === 'credit') {
        li.textContent = `${tx.description} (+${tx.points} créditos)`;
        totalPontos += tx.points;
      } else {
        li.textContent = `${tx.description} (-${tx.points} créditos)`;
        li.style.color = 'red';
        totalDivida += tx.points;
      }
      listaAcoes.appendChild(li);
    });

    totalPontosSpan.textContent = totalPontos;
    totalDividaSpan.textContent = totalDivida;
  }

  // Adiciona uma nova ação (crédito)
  btnAdicionar.addEventListener('click', async () => {
    const description = inputDescricao.value.trim();
    const points = parseInt(inputPontos.value);

    if (description === '' || isNaN(points) || points <= 0) {
      alert('Preencha a descrição e os pontos corretamente.');
      return;
    }

    const { error } = await supaClient.from('transactions').insert([
      { user_id: currentUser.id, description, points, type: 'credit' },
    ]);

    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
    } else {
      loadUserTransactions(); // Recarrega a lista
      inputDescricao.value = '';
      inputPontos.value = '';
    }
  });

  // Adiciona uma nova infração (débito)
  btnAdicionarInfracao.addEventListener('click', async () => {
    const description = inputDescricaoInfracao.value.trim();
    const points = parseInt(inputPontosInfracao.value);

    if (description === '' || isNaN(points) || points <= 0) {
      alert('Preencha a infração e os pontos corretamente.');
      return;
    }

    const { error } = await supaClient.from('transactions').insert([
      { user_id: currentUser.id, description, points, type: 'debit' },
    ]);

    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
    } else {
      loadUserTransactions(); // Recarrega a lista
      inputDescricaoInfracao.value = '';
      inputPontosInfracao.value = '';
    }
  });

  // A lógica de pagar a dívida precisa ser repensada com o banco de dados.
  // Uma abordagem seria criar uma nova transação de "pagamento".
  // Por enquanto, vou desabilitar o botão para evitar confusão.
  btnPagarDivida.disabled = true;
  btnPagarDivida.style.backgroundColor = '#ccc';
  btnPagarDivida.textContent = 'Funcionalidade em desenvolvimento';
});
