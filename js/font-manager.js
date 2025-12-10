// Gerenciador de Tamanho de Fonte para Acessibilidade
const FontManager = {
    // Níveis de tamanho de fonte (0 = muito pequeno, 4 = muito grande)
    fontSizes: ['small', 'medium-small', 'normal', 'medium-large', 'large'],
    fontLabels: ['Muito Pequeno', 'Pequeno', 'Normal', 'Grande', 'Muito Grande'],
    
    init() {
        // Carregar tamanho salvo ou usar padrão (2 = normal)
        const savedSize = localStorage.getItem('fontSize') || '2';
        this.applyFontSize(parseInt(savedSize));
        
        // Se estiver na página de configurações, configurar controles
        if (document.getElementById('font-size-slider')) {
            this.setupControls();
        }
    },
    
    applyFontSize(level) {
        // Remover classes antigas
        this.fontSizes.forEach(size => {
            document.documentElement.classList.remove(`font-${size}`);
        });
        
        // Adicionar nova classe
        const sizeClass = this.fontSizes[level];
        document.documentElement.classList.add(`font-${sizeClass}`);
        
        // Salvar preferência
        localStorage.setItem('fontSize', level.toString());
        
        // Atualizar indicador se existir
        const indicator = document.getElementById('font-size-indicator');
        if (indicator) {
            indicator.textContent = this.fontLabels[level];
        }
        
        // Atualizar slider se existir
        const slider = document.getElementById('font-size-slider');
        if (slider) {
            slider.value = level;
            this.updateSliderBackground(level);
        }
    },
    
    setupControls() {
        const slider = document.getElementById('font-size-slider');
        const decreaseBtn = document.getElementById('font-decrease');
        const increaseBtn = document.getElementById('font-increase');
        
        // Slider
        slider.addEventListener('input', (e) => {
            const level = parseInt(e.target.value);
            this.applyFontSize(level);
        });
        
        // Botão diminuir
        decreaseBtn.addEventListener('click', () => {
            const current = parseInt(slider.value);
            if (current > 0) {
                this.applyFontSize(current - 1);
            }
        });
        
        // Botão aumentar
        increaseBtn.addEventListener('click', () => {
            const current = parseInt(slider.value);
            if (current < 4) {
                this.applyFontSize(current + 1);
            }
        });
        
        // Atualizar background do slider
        slider.addEventListener('input', (e) => {
            this.updateSliderBackground(parseInt(e.target.value));
        });
        
        // Aplicar estilo inicial
        const currentLevel = parseInt(localStorage.getItem('fontSize') || '2');
        this.updateSliderBackground(currentLevel);
    },
    
    updateSliderBackground(value) {
        const slider = document.getElementById('font-size-slider');
        if (!slider) return;
        
        const percentage = (value / 4) * 100;
        slider.style.background = `linear-gradient(to right, #7A1919 0%, #7A1919 ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
    }
};

// Inicializar ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FontManager.init());
} else {
    FontManager.init();
}
