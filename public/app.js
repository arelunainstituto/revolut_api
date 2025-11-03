const API_BASE = 'http://localhost:3006/api';

let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function checkAuth() {
    if (authToken) {
        verifyToken();
    } else {
        showLogin();
    }
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            currentUser = await response.json();
            showMain();
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
            showLogin();
        }
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('main-content').classList.add('hidden');
}

function showMain() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    if (currentUser) {
        document.getElementById('user-name').textContent = `👤 ${currentUser.username}`;
    }
}

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });

    // Configuration
    document.getElementById('configForm').addEventListener('submit', testConnection);
    
    // Load saved config
    loadSavedConfig();

    // Accounts
    document.getElementById('loadAccountsBtn').addEventListener('click', loadAccounts);

    // Transactions
    document.getElementById('loadTransactionsBtn').addEventListener('click', loadTransactions);

    // Payments
    document.getElementById('paymentForm').addEventListener('submit', createPayment);

    // Counterparties
    document.getElementById('loadCounterpartiesBtn').addEventListener('click', loadCounterparties);

    // Exchange rate
    document.getElementById('exchangeForm').addEventListener('submit', getExchangeRate);
}

async function handleLogin(e) {
    e.preventDefault();
    showLoading();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.access_token;
            localStorage.setItem('authToken', authToken);
            currentUser = { username };
            showMain();
            hideError();
        } else {
            showError(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        showError('Erro ao conectar com o servidor');
    } finally {
        hideLoading();
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    showLogin();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(error.message || `Erro ${response.status}`);
    }

    return response.json();
}

async function loadAccounts() {
    showLoading();
    try {
        const accounts = await apiCall('/revolut/accounts');
        displayAccounts(accounts);
        hideError();
    } catch (error) {
        showError(`Erro ao carregar contas: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function displayAccounts(accounts) {
    const container = document.getElementById('accountsList');
    
    if (!accounts || accounts.length === 0) {
        container.innerHTML = '<p>Nenhuma conta encontrada.</p>';
        return;
    }

    container.innerHTML = accounts.map(account => `
        <div class="card">
            <h3>${account.name || account.id}</h3>
            <p><strong>ID:</strong> ${account.id}</p>
            <p><strong>Moeda:</strong> ${account.currency || 'N/A'}</p>
            <p><strong>Estado:</strong> ${account.state || 'N/A'}</p>
            ${account.balance ? `<div class="value">${account.balance} ${account.currency || ''}</div>` : ''}
            <button class="btn btn-secondary" onclick="loadAccountBalance('${account.id}')" style="margin-top: 10px;">
                Ver Saldo
            </button>
        </div>
    `).join('');
}

async function loadAccountBalance(accountId) {
    showLoading();
    try {
        const balance = await apiCall(`/revolut/accounts/${accountId}/balance`);
        showError(`Saldo: ${balance.balance || balance.amount || 'N/A'} ${balance.currency || ''}`, 'success');
    } catch (error) {
        showError(`Erro ao carregar saldo: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function loadTransactions() {
    showLoading();
    try {
        const accountId = document.getElementById('accountId').value;
        const endpoint = accountId 
            ? `/revolut/transactions?account_id=${accountId}`
            : '/revolut/transactions';
        
        const transactions = await apiCall(endpoint);
        displayTransactions(transactions);
        hideError();
    } catch (error) {
        showError(`Erro ao carregar transações: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p>Nenhuma transação encontrada.</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Moeda</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(t => `
                    <tr>
                        <td>${t.id || 'N/A'}</td>
                        <td>${t.created_at ? new Date(t.created_at).toLocaleString('pt-BR') : 'N/A'}</td>
                        <td>${t.type || 'N/A'}</td>
                        <td>${t.amount || 'N/A'}</td>
                        <td>${t.currency || 'N/A'}</td>
                        <td>${t.state || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function createPayment(e) {
    e.preventDefault();
    showLoading();

    const paymentData = {
        account_id: document.getElementById('paymentAccountId').value,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        currency: document.getElementById('paymentCurrency').value,
        counterparty_id: document.getElementById('paymentCounterpartyId').value,
        reference: document.getElementById('paymentReference').value || undefined
    };

    try {
        const result = await apiCall('/revolut/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });

        document.getElementById('paymentResult').innerHTML = `
            <h3>✅ Pagamento criado com sucesso!</h3>
            <pre>${JSON.stringify(result, null, 2)}</pre>
        `;
        hideError();
    } catch (error) {
        showError(`Erro ao criar pagamento: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function loadCounterparties() {
    showLoading();
    try {
        const counterparties = await apiCall('/revolut/counterparties');
        displayCounterparties(counterparties);
        hideError();
    } catch (error) {
        showError(`Erro ao carregar contrapartes: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function displayCounterparties(counterparties) {
    const container = document.getElementById('counterpartiesList');
    
    if (!counterparties || counterparties.length === 0) {
        container.innerHTML = '<p>Nenhuma contraparte encontrada.</p>';
        return;
    }

    container.innerHTML = counterparties.map(cp => `
        <div class="card">
            <h3>${cp.name || cp.id}</h3>
            <p><strong>ID:</strong> ${cp.id}</p>
            <p><strong>Tipo:</strong> ${cp.type || 'N/A'}</p>
            ${cp.account_details ? `
                <p><strong>IBAN:</strong> ${cp.account_details.iban || 'N/A'}</p>
                <p><strong>BIC:</strong> ${cp.account_details.bic || 'N/A'}</p>
            ` : ''}
        </div>
    `).join('');
}

async function getExchangeRate(e) {
    e.preventDefault();
    showLoading();

    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;

    try {
        const rate = await apiCall(`/revolut/exchange-rate?from=${from}&to=${to}`);
        document.getElementById('exchangeResult').innerHTML = `
            <h3>Taxa de Câmbio</h3>
            <p><strong>${from} → ${to}</strong></p>
            <div class="value">${rate.rate || 'N/A'}</div>
            ${rate.date ? `<p>Data: ${new Date(rate.date).toLocaleDateString('pt-BR')}</p>` : ''}
        `;
        hideError();
    } catch (error) {
        showError(`Erro ao obter taxa: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message, type = 'error') {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.className = type === 'error' ? 'error' : 'result-card';
    errorDiv.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(() => hideError(), 5000);
    }
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

function loadSavedConfig() {
    const savedClientId = localStorage.getItem('revolut_clientId');
    const savedPrivateKey = localStorage.getItem('revolut_privateKey');
    const savedOAuthRedirect = localStorage.getItem('revolut_oauthRedirect');
    const savedSandbox = localStorage.getItem('revolut_sandbox') === 'true';
    
    if (savedClientId) document.getElementById('clientId').value = savedClientId;
    if (savedPrivateKey) document.getElementById('privateKey').value = savedPrivateKey;
    if (savedOAuthRedirect) document.getElementById('oauthRedirect').value = savedOAuthRedirect;
    if (savedSandbox !== null) document.getElementById('sandboxMode').checked = savedSandbox;
}

async function testConnection(e) {
    e.preventDefault();
    showLoading();
    
    const clientId = document.getElementById('clientId').value;
    const privateKey = document.getElementById('privateKey').value;
    const oauthRedirect = document.getElementById('oauthRedirect').value;
    const sandbox = document.getElementById('sandboxMode').checked;
    
    // Save to localStorage
    localStorage.setItem('revolut_clientId', clientId);
    localStorage.setItem('revolut_privateKey', privateKey);
    localStorage.setItem('revolut_oauthRedirect', oauthRedirect);
    localStorage.setItem('revolut_sandbox', sandbox.toString());
    
    const configResult = document.getElementById('configResult');
    
    try {
        // Validate inputs
        if (!clientId || !privateKey) {
            throw new Error('Client ID e Private Key são obrigatórios');
        }
        
        // Validate private key format
        if (!privateKey.includes('BEGIN') || !privateKey.includes('END')) {
            throw new Error('Private Key deve estar em formato PEM válido');
        }
        
        // Test connection by trying to get accounts
        const accounts = await apiCall('/revolut/accounts');
        
        configResult.innerHTML = `
            <h3>✅ Conexão bem-sucedida!</h3>
            <p>Configuração salva e testada com sucesso.</p>
            <p><strong>Client ID:</strong> ${clientId}</p>
            <p><strong>Modo:</strong> ${sandbox ? 'Sandbox (Testes)' : 'Produção'}</p>
            ${accounts && accounts.length > 0 ? `<p><strong>Contas encontradas:</strong> ${accounts.length}</p>` : ''}
        `;
        configResult.classList.remove('hidden');
        hideError();
        
        // Switch to accounts tab
        setTimeout(() => {
            switchTab('accounts');
            loadAccounts();
        }, 2000);
        
    } catch (error) {
        configResult.innerHTML = `
            <h3>❌ Erro na conexão</h3>
            <p><strong>Erro:</strong> ${error.message}</p>
            <p>Verifique se:</p>
            <ul>
                <li>O Client ID está correto</li>
                <li>A Private Key está no formato PEM correto</li>
                <li>O certificado foi enviado para o portal da Revolut</li>
                <li>O modo Sandbox está correto (se aplicável)</li>
            </ul>
        `;
        configResult.classList.remove('hidden');
        showError(`Erro ao testar conexão: ${error.message}`);
    } finally {
        hideLoading();
    }
}

