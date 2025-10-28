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
        const imageMappings = {
            'treino.png': 'treino(bt).png',
            'comida-e-restaurante.png': 'comida-e-restaurante (bt).png'
        };
        
        // Encontra todas as imagens que precisam ser alteradas
        document.querySelectorAll('img').forEach(img => {
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
        this.updateImages(savedTheme);
        
        // Escuta mudanças de tema de outras abas/janelas
        window.addEventListener('storage', (e) => {
            if (e.key === this.THEME_KEY) {
                document.documentElement.setAttribute('data-theme', e.newValue);
                this.updateImages(e.newValue);
            }
        });
        
        // Escuta evento customizado de mudança de tema
        window.addEventListener('themechange', (e) => {
            document.documentElement.setAttribute('data-theme', e.detail.theme);
            this.updateImages(e.detail.theme);
        });
    }
};