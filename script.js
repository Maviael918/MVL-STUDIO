document.addEventListener('DOMContentLoaded', () => {
  // Elementos da UI
  const authSection = document.getElementById('auth-section');
  const panelContent = document.getElementById('panel-content');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const manageDopamineBtn = document.getElementById('manage-dopamine-btn');

  let currentUser = null;

  // --- GERENCIAMENTO DE AUTENTICAÇÃO ---

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

  loginBtn.addEventListener('click', async () => {
    const { data, error } = await supaClient.auth.signInWithPassword({
      email: emailInput.value,
      password: passwordInput.value,
    });
    if (error) {
      alert(`Erro no login: ${error.message}`);
    }
    // A sessão será detectada pelo onAuthStateChange
  });

  logoutBtn.addEventListener('click', async () => {
    await supaClient.auth.signOut();
  });

  // Monitora o estado da autenticação
  supaClient.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      currentUser = session.user;
      authSection.style.display = 'none';
      panelContent.style.display = 'block';
      logoutBtn.style.display = 'block';
    } else {
      currentUser = null;
      authSection.style.display = 'block';
      panelContent.style.display = 'none';
      logoutBtn.style.display = 'none';
    }
  });

  // --- NAVEGAÇÃO ---

  manageDopamineBtn.addEventListener('click', () => {
    window.location.href = 'dopamine_flow_system.html';
  });
});
