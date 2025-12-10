// Gerenciador de tema
const ThemeManager = {
    // Chave usada no localStorage
    THEME_KEY: 'theme-preference',
    
    // Obtém o tema atual
    getCurrentTheme() {
        return localStorage.getItem(this.THEME_KEY) || 'light';
    },
    
    // Define o tema
    setTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        // Adiciona/remove classe dark-mode no body para compatibilidade
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Atualiza as imagens baseado no tema
        this.updateImages(theme);
        
        // Dispara evento customizado para outras páginas abertas
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },
    
    // Alterna entre temas
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },
    
    // Atualiza imagens baseado no tema
    updateImages(theme) {
        // Atualiza imagens com atributos data-light e data-dark
        document.querySelectorAll('img.theme-image').forEach(img => {
            const lightSrc = img.getAttribute('data-light');
            const darkSrc = img.getAttribute('data-dark');
            
            if (lightSrc && darkSrc) {
                img.src = theme === 'dark' ? darkSrc : lightSrc;
            }
        });
        
        // Fallback: mapeia imagens sem atributos data-*
        const imageMappings = {
            'treino.png': 'treino(bt).png',
            'dieta.png': 'dieta(bt).png',
            'comida-e-restaurante.png': 'comida-e-restaurante (bt).png'
        };
        
        // Encontra todas as imagens que precisam ser alteradas
        document.querySelectorAll('img:not(.theme-image)').forEach(img => {
            const src = img.getAttribute('src');
            if (!src) return;
            
            const filename = src.split('/').pop();
            
            if (theme === 'dark') {
                // Troca para versão escura
                if (imageMappings[filename]) {
                    const newSrc = src.replace(filename, imageMappings[filename]);
                    img.setAttribute('src', newSrc);
                }
            } else {
                // Volta para versão clara
                Object.entries(imageMappings).forEach(([lightVersion, darkVersion]) => {
                    if (filename === darkVersion) {
                        const newSrc = src.replace(darkVersion, lightVersion);
                        img.setAttribute('src', newSrc);
                    }
                });
            }
        });
    },
    
    // Inicializa o tema
    init() {
        // Aplica o tema salvo
        const savedTheme = this.getCurrentTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Adiciona classe dark-mode no body se necessário
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        this.updateImages(savedTheme);
        
        // Escuta mudanças de tema de outras abas/janelas
        window.addEventListener('storage', (e) => {
            if (e.key === this.THEME_KEY) {
                document.documentElement.setAttribute('data-theme', e.newValue);
                
                if (e.newValue === 'dark') {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
                
                this.updateImages(e.newValue);
            }
        });
        
        // Escuta evento customizado de mudança de tema
        window.addEventListener('themechange', (e) => {
            document.documentElement.setAttribute('data-theme', e.detail.theme);
            
            if (e.detail.theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            this.updateImages(e.detail.theme);
        });
    }
};

// Utilitários de autenticação
const AuthManager = {
    // Chave para dados de sessão do usuário
    getUserDataKey(email) {
        return `userData_${email}`;
    },

    // Salvar dados específicos do usuário (chat, treino, dieta, etc)
    saveUserData(email, data) {
        const key = this.getUserDataKey(email);
        const existingData = this.getUserData(email);
        const mergedData = { ...existingData, ...data };
        localStorage.setItem(key, JSON.stringify(mergedData));
    },

    // Obter dados específicos do usuário
    getUserData(email) {
        const key = this.getUserDataKey(email);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {
            chatHistory: [],
            treino: null,
            dieta: null,
            alimentacao: [],
            preferences: {}
        };
    },

    // Limpar dados do usuário ao fazer logout (NÃO MAIS NECESSÁRIO - mantém tudo)
    clearUserSession(email) {
        // Não faz nada - mantém os dados salvos
    },

    // Verificar se usuário está logado
    isLoggedIn() {
        return localStorage.getItem('usuarioLogado') !== null;
    },
    
    // Obter dados do usuário logado
    getLoggedUser() {
        const user = localStorage.getItem('usuarioLogado');
        return user ? JSON.parse(user) : null;
    },
    
    // Fazer logout (mantém dados do usuário salvos)
    logout() {
        const user = this.getLoggedUser();
        if (user) {
            // Salva dados da sessão atual antes de sair
            this.syncCurrentSessionData(user.email);
        }
        localStorage.removeItem('usuarioLogado');
        window.location.href = "index.html";
    },

    // Sincronizar dados da sessão atual com os dados do usuário
    syncCurrentSessionData(email) {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const treino = JSON.parse(localStorage.getItem('treino') || 'null');
        const dieta = JSON.parse(localStorage.getItem('dieta') || 'null');
        const analiseHistorico = JSON.parse(localStorage.getItem('analiseHistorico') || '[]');

        this.saveUserData(email, {
            chatHistory: chatHistory,
            treino: treino,
            dieta: dieta,
            alimentacao: analiseHistorico
        });
    },

    // Carregar dados do usuário ao fazer login
    loadUserSessionData(email) {
        const userData = this.getUserData(email);
        
        // Restaura histórico de chat
        if (userData.chatHistory && userData.chatHistory.length > 0) {
            localStorage.setItem('chatHistory', JSON.stringify(userData.chatHistory));
        } else {
            localStorage.removeItem('chatHistory');
        }

        // Restaura treino
        if (userData.treino) {
            localStorage.setItem('treino', JSON.stringify(userData.treino));
        } else {
            localStorage.removeItem('treino');
        }

        // Restaura dieta
        if (userData.dieta) {
            localStorage.setItem('dieta', JSON.stringify(userData.dieta));
        } else {
            localStorage.removeItem('dieta');
        }

        // Restaura histórico de alimentação
        if (userData.alimentacao && userData.alimentacao.length > 0) {
            localStorage.setItem('analiseHistorico', JSON.stringify(userData.alimentacao));
        } else {
            localStorage.removeItem('analiseHistorico');
        }
    },
    
    // Redirecionar para login se não estiver logado
    requireAuth() {
        if (!this.isLoggedIn()) {
            // Tenta usar showToast se disponível, caso contrário usa alert
            if (typeof showToast === 'function') {
                showToast('Acesso Negado 🔒', 'Você precisa fazer login para acessar esta página.', 'warning');
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);
            } else {
                alert('Você precisa fazer login para acessar esta página.');
                window.location.href = "index.html";
            }
            return false;
        }
        return true;
    },
    
    // Atualizar dados do usuário logado
    updateLoggedUser(newData) {
        let usuario = this.getLoggedUser();
        if (usuario) {
            usuario = { ...usuario, ...newData };
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            
            // Atualiza também na lista de usuários
            let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            usuarios = usuarios.map(u => u.email === usuario.email ? { ...u, ...newData } : u);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }
    }
};

// Função utilitária para aplicar estilos de input baseados no tema atual
function applyThemeInputStyles(input) {
    if (!input) return;
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        // Remove estilos inline que conflitam com o modo escuro
        input.style.color = '';
        input.style.backgroundColor = '';
        input.style.border = '';
        
        // Adiciona classe para CSS do modo escuro
        input.classList.add('theme-aware-input');
    } else {
        // Estilos para modo claro
        input.style.color = '#222';
        input.style.backgroundColor = '#fff';
        input.style.border = '1px solid #ccc';
    }
}