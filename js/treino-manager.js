/**
 * TreinoManager - Gerenciador de Treinos
 * Sistema completo de execução de treinos com:
 * - Seleção de dias
 * - Lista de exercícios
 * - Execução detalhada com timer
 * - Progresso de séries
 * - Gerenciamento de carga
 * - Histórico de treinos
 */

const TreinoManager = {
    // Estado atual da aplicação
    currentView: 'dia-selection', // 'dia-selection', 'exercicio-list', 'execution', 'historico'
    selectedDia: null,
    exercicios: [],
    currentExercicioIndex: 0,
    currentSerie: 0,
    timerInterval: null,
    timerSeconds: 0,
    isResting: false,
    
    // Cache de GIFs locais
    exerciseGifsCache: {},
    
    /**
     * Inicializa o gerenciador de treinos
     */
    async init() {
        // Aguarda o serviço de exercícios locais carregar
        if (typeof LocalExerciseService !== 'undefined') {
            await LocalExerciseService.loadData();
        }
        
        this.loadTreino();
        this.renderCurrentView();
        this.preloadExerciseGifs();
    },
    
    /**
     * Carrega os dados do treino do localStorage
     */
    loadTreino() {
        // Primeiro tenta carregar o plano personalizado do chat
        const customPlan = JSON.parse(localStorage.getItem('customWorkoutPlan') || 'null');
        
        if (customPlan && customPlan.treinos) {
            // Converte o plano do chat para o formato do TreinoManager
            this.treinoData = this.convertChatPlanToTreino(customPlan);
        } else {
            // Fallback para o formato antigo
            this.treinoData = JSON.parse(localStorage.getItem('treino') || '[]');
        }
    },
    
    /**
     * Converte plano do chat para formato do TreinoManager
     */
    convertChatPlanToTreino(customPlan) {
        const treinoData = [];
        const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        customPlan.treinos.forEach((treino, index) => {
            const dia = diasSemana[index] || `Dia ${index + 1}`;
            
            treino.exercicios.forEach(ex => {
                treinoData.push({
                    dia: dia,
                    exercicio: ex.name,
                    series: ex.series || 3,
                    repeticoes: ex.repeticoes || 12,
                    descanso: ex.descanso || '60s',
                    descricao: `${treino.grupos.join(', ')} - ${ex.location === 'casa' ? '🏠 Casa' : '🏋️ Academia'}`,
                    exercicioId: ex.id,
                    bodyParts: ex.bodyParts || [],
                    targetMuscles: ex.targetMuscles || []
                });
            });
        });
        
        return treinoData;
    },
    
    /**
     * Pré-carrega os GIFs dos exercícios do treino usando serviço local
     */
    async preloadExerciseGifs() {
        if (!this.treinoData || this.treinoData.length === 0) return;
        
        // Extrai todos os nomes de exercícios únicos
        const exerciseNames = [...new Set(this.treinoData.map(ex => ex.exercicio))];
        
        console.log('🎬 Carregando GIFs dos exercícios...');
        
        // Busca os GIFs do serviço local
        for (const name of exerciseNames) {
            // Verifica se já está no cache
            if (this.exerciseGifsCache[name]) {
                console.log(`✅ Cache: ${name}`);
                continue;
            }
            
            // Usa o serviço local
            if (typeof LocalExerciseService !== 'undefined') {
                const exerciseData = LocalExerciseService.searchExercise(name);
                if (exerciseData) {
                    this.exerciseGifsCache[name] = exerciseData;
                    console.log(`✅ Local: ${name} -> ${exerciseData.name}`);
                } else {
                    console.log(`⚠️ Exercício não encontrado: ${name}`);
                }
            }
        }
        
        console.log(`✅ ${Object.keys(this.exerciseGifsCache).length} GIFs carregados`);
        
        // Re-renderiza a view atual se necessário
        if (this.currentView === 'exercicio-list' || this.currentView === 'execution') {
            this.renderCurrentView();
        }
    },
    
    /**
     * Obtém o GIF de um exercício do cache
     */
    getExerciseGif(exercicioNome, exercicioId = null) {
        // Tenta buscar por ID primeiro se disponível
        if (exercicioId && typeof LocalExerciseService !== 'undefined') {
            const exerciseById = LocalExerciseService.exercises.find(ex => ex.id === exercicioId);
            if (exerciseById) {
                return {
                    ...exerciseById,
                    gifUrl: exerciseById.gifUrl
                };
            }
        }
        
        // Fallback: busca por nome no cache
        return this.exerciseGifsCache[exercicioNome] || null;
    },
    
    /**
     * Obtém o email do usuário logado
     */
    getUserEmail() {
        return AuthManager.getLoggedUser()?.email || 'guest';
    },
    
    /**
     * Carrega o progresso do usuário do localStorage
     */
    loadProgress() {
        const email = this.getUserEmail();
        const key = `treinoProgress_${email}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    },
    
    /**
     * Salva o progresso do usuário no localStorage
     */
    saveProgress(progress) {
        const email = this.getUserEmail();
        const key = `treinoProgress_${email}`;
        localStorage.setItem(key, JSON.stringify(progress));
    },
    
    /**
     * Carrega as cargas definidas pelo usuário
     */
    loadCargas() {
        const email = this.getUserEmail();
        const key = `treinoCargas_${email}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    },
    
    /**
     * Salva as cargas definidas pelo usuário
     */
    saveCargas(cargas) {
        const email = this.getUserEmail();
        const key = `treinoCargas_${email}`;
        localStorage.setItem(key, JSON.stringify(cargas));
    },
    
    /**
     * Obtém a chave única de um exercício
     */
    getExercicioKey(dia, exercicioNome) {
        return `${dia}|${exercicioNome}`;
    },
    
    /**
     * Renderiza a view atual
     */
    renderCurrentView() {
        const container = document.getElementById('treino-main-container');
        
        // Controla visibilidade dos botões
        const btnCardio = document.getElementById('btn-cardio');
        const btnChatTreino = document.getElementById('fab-chat-treino');
        
        if (this.currentView === 'dia-selection') {
            container.innerHTML = this.renderDiaSelection();
            // Mostra botões apenas na tela de seleção de dias
            if (btnCardio) btnCardio.style.display = 'flex';
            if (btnChatTreino) btnChatTreino.style.display = 'flex';
        } else if (this.currentView === 'exercicio-list') {
            container.innerHTML = this.renderExercicioList();
            // Esconde botões
            if (btnCardio) btnCardio.style.display = 'none';
            if (btnChatTreino) btnChatTreino.style.display = 'none';
        } else if (this.currentView === 'execution') {
            container.innerHTML = this.renderExecution();
            this.initExecutionListeners();
            // Esconde botões
            if (btnCardio) btnCardio.style.display = 'none';
            if (btnChatTreino) btnChatTreino.style.display = 'none';
        } else if (this.currentView === 'cardio-list') {
            // Renderizado pelo renderCardioScreen()
            // Esconde botões
            if (btnCardio) btnCardio.style.display = 'none';
            if (btnChatTreino) btnChatTreino.style.display = 'none';
        } else if (this.currentView === 'chat-treino') {
            container.innerHTML = this.renderChatTreino();
            // Esconde botões
            if (btnCardio) btnCardio.style.display = 'none';
            if (btnChatTreino) btnChatTreino.style.display = 'none';
        }
    },
    
    /**
     * Renderiza a tela de seleção de dia
     */
    renderDiaSelection() {
        if (!this.treinoData || this.treinoData.length === 0) {
            return `
                <div class="dia-selection-screen">
                    <h2 class="dia-selection-title">Seu Plano de Treino</h2>
                    <div class="sem-treino">
                        Nenhum treino definido ainda.<br>
                        Vá para o Chat IA para criar seu treino personalizado!
                    </div>
                </div>
            `;
        }
        
        // Agrupar exercícios por dia
        const diasMap = {};
        this.treinoData.forEach(item => {
            if (!diasMap[item.dia]) {
                diasMap[item.dia] = [];
            }
            diasMap[item.dia].push(item);
        });
        
        // Ordem dos dias da semana
        const ordensDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        let cardsHTML = '';
        
        ordensDias.forEach(dia => {
            if (diasMap[dia]) {
                const exercicios = diasMap[dia];
                
                // Verificar se é dia de descanso
                const isDescanso = exercicios.some(ex => 
                    ex.exercicio && (ex.exercicio.toLowerCase().includes('descanso') || 
                                    ex.exercicio.toLowerCase().includes('recuperação'))
                );
                
                if (isDescanso) {
                    cardsHTML += `
                        <div class="dia-card descanso">
                            <div class="dia-nome">${dia}</div>
                            <div class="dia-resumo">😴 Descanso</div>
                            <div class="dia-exercicios">Dia de recuperação muscular</div>
                        </div>
                    `;
                } else {
                    // Extrair músculos/grupos trabalhados
                    const musculos = this.extrairMusculos(exercicios);
                    const resumo = musculos.length > 0 ? musculos.join(', ') : 'Treino';
                    
                    const numExercicios = exercicios.length;
                    const previewText = `${numExercicios} exercício${numExercicios > 1 ? 's' : ''}`;
                    
                    cardsHTML += `
                        <div class="dia-card" onclick="TreinoManager.selectDia('${dia}')">
                            <div class="dia-nome">${dia}</div>
                            <div class="dia-resumo">💪 ${resumo}</div>
                            <div class="dia-exercicios">${previewText} • Toque para começar</div>
                        </div>
                    `;
                }
            }
        });
        
        return `
            <div class="dia-selection-screen">
                <h2 class="dia-selection-title">Seu Plano de Treino</h2>
                <div class="dias-grid">
                    ${cardsHTML}
                </div>
            </div>
        `;
    },
    
    /**
     * Seleciona um dia e mostra a lista de exercícios
     */
    selectDia(dia) {
        this.selectedDia = dia;
        this.exercicios = this.treinoData.filter(item => item.dia === dia);
        this.currentView = 'exercicio-list';
        this.renderCurrentView();
    },
    
    /**
     * Renderiza a lista de exercícios do dia
     */
    renderExercicioList() {
        const cargas = this.loadCargas();
        const progress = this.loadProgress();
        
        let exerciciosHTML = '';
        
        this.exercicios.forEach((ex, index) => {
            const key = this.getExercicioKey(this.selectedDia, ex.exercicio);
            const carga = cargas[key] || '-';
            const isCompleted = progress[key]?.completed || false;
            
            // Extrair séries, repetições e descanso da descrição
            const info = this.parseExercicioInfo(ex.descricao);
            
            // Extrair músculos trabalhados
            const musculos = this.extrairMusculos([ex]);
            const musculosText = musculos.length > 0 ? musculos.join(', ') : 'Músculos variados';
            
            // Busca o GIF da API
            const gifData = this.getExerciseGif(ex.exercicio, ex.exercicioId);
            const gifHTML = gifData && gifData.gifUrl
                ? `<img src="/exercises_gifs/${gifData.gifUrl}" alt="${ex.exercicio}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='🏋️';">`
                : '🏋️';
            
            exerciciosHTML += `
                <div class="exercicio-card" onclick="TreinoManager.startExecution(${index})">
                    <div class="exercicio-card-gif">
                        ${gifHTML}
                    </div>
                    <div class="exercicio-card-content">
                        <div class="exercicio-card-header">
                            <div class="exercicio-card-name">${ex.exercicio}</div>
                        </div>
                        <div class="exercicio-card-musculos">🎯 ${musculosText}</div>
                        <div class="exercicio-card-info-grid">
                            <div class="exercicio-card-info-item">
                                <div class="exercicio-card-info-label">Séries</div>
                                <div class="exercicio-card-info-value">${info.series}</div>
                            </div>
                            <div class="exercicio-card-info-item">
                                <div class="exercicio-card-info-label">Reps</div>
                                <div class="exercicio-card-info-value">${info.repeticoes}</div>
                            </div>
                            <div class="exercicio-card-info-item">
                                <div class="exercicio-card-info-label">Carga</div>
                                <div class="exercicio-card-info-value">${carga}</div>
                            </div>
                            <div class="exercicio-card-info-item">
                                <div class="exercicio-card-info-label">Descanso</div>
                                <div class="exercicio-card-info-value">${info.descanso}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return `
            <div class="exercicio-list-screen">
                <div class="exercicio-list-header">
                    <button class="back-btn" onclick="TreinoManager.backToDiaSelection()">
                        ←
                    </button>
                    <h2 class="exercicio-list-title">${this.selectedDia}</h2>
                </div>
                <div class="exercicios-grid">
                    ${exerciciosHTML}
                </div>
            </div>
        `;
    },
    
    /**
     * Volta para a seleção de dia
     */
    backToDiaSelection() {
        this.selectedDia = null;
        this.exercicios = [];
        this.currentView = 'dia-selection';
        this.renderCurrentView();
    },
    
    /**
     * Inicia a execução de um exercício
     */
    startExecution(index) {
        this.currentExercicioIndex = index;
        this.currentSerie = 1;
        this.isResting = false;
        this.currentView = 'execution';
        this.renderCurrentView();
    },
    
    /**
     * Renderiza a tela de execução detalhada
     */
    renderExecution() {
        const ex = this.exercicios[this.currentExercicioIndex];
        const info = this.parseExercicioInfo(ex.descricao);
        const cargas = this.loadCargas();
        const key = this.getExercicioKey(this.selectedDia, ex.exercicio);
        const carga = cargas[key] || '-';
        
        // Busca o GIF da API
        const gifData = this.getExerciseGif(ex.exercicio, ex.exercicioId);
        const gifHTML = gifData && gifData.gifUrl
            ? `<img src="/exercises_gifs/${gifData.gifUrl}" alt="${ex.exercicio}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'execution-gif-placeholder\\'>🏋️</div>';">`
            : '<div class="execution-gif-placeholder">🏋️</div>';
        
        // GIF para o modal de ampliar
        const gifFullscreenHTML = gifData && gifData.gifUrl
            ? `<img src="/exercises_gifs/${gifData.gifUrl}" alt="${ex.exercicio}" class="modal-fullscreen-img" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'execution-gif-placeholder\\' style=\\'font-size: 128px;\\'>🏋️</div>';">`
            : '<div class="execution-gif-placeholder" style="font-size: 128px;">🏋️</div>';
        
        // Prepara instruções e músculos do exercício
        let instructionsHTML = ex.descricao;
        let musclesHTML = this.extrairMusculos([ex]).join(', ') || 'Músculos variados';
        
        // Se tem dados do exercício local, usa instruções detalhadas
        if (gifData && gifData.instructions && gifData.instructions.length > 0) {
            instructionsHTML = '<ol class="exercise-instructions">';
            gifData.instructions.forEach((instruction, index) => {
                instructionsHTML += `<li>${instruction}</li>`;
            });
            instructionsHTML += '</ol>';
        }
        
        // Se tem dados de músculos, usa informações detalhadas
        if (gifData && gifData.targetMuscles && gifData.targetMuscles.length > 0) {
            musclesHTML = `
                <p><strong>Músculos Principais:</strong> ${gifData.targetMuscles.join(', ')}</p>
                ${gifData.secondaryMuscles && gifData.secondaryMuscles.length > 0 
                    ? `<p><strong>Músculos Secundários:</strong> ${gifData.secondaryMuscles.join(', ')}</p>` 
                    : ''}
                ${gifData.equipments && gifData.equipments.length > 0 
                    ? `<p><strong>Equipamento:</strong> ${gifData.equipments.join(', ')}</p>` 
                    : ''}
            `;
        }
        
        // Renderizar bolinhas de progresso
        let progressCirclesHTML = '';
        for (let i = 1; i <= info.seriesNum; i++) {
            let circleClass = 'pending';
            if (i < this.currentSerie) {
                circleClass = 'completed';
            } else if (i === this.currentSerie) {
                circleClass = this.isResting ? 'resting' : 'current';
            }
            
            progressCirclesHTML += `
                <div class="progress-circle ${circleClass}" onclick="TreinoManager.goToSerie(${i})">
                    ${i}
                </div>
            `;
        }
        
        // Timer e label
        let timerLabelHTML = `Série ${this.currentSerie} de ${info.seriesNum}`;
        
        // Botão principal - muda entre Realizado e Descanso
        let mainButtonHTML = '';
        if (this.isResting) {
            // Durante o descanso: mostra timer e permite pular
            mainButtonHTML = `
                <button class="execution-done-btn-large resting" onclick="TreinoManager.skipRest()">
                    <div class="execution-done-timer">${this.formatTime(this.timerSeconds)}</div>
                    <div class="execution-done-text">Descanso</div>
                </button>
            `;
        } else {
            // Durante a série: botão Realizado
            mainButtonHTML = `
                <button class="execution-done-btn-large" onclick="TreinoManager.completeSerie()">
                    <div class="execution-done-checkmark">✓</div>
                    <div class="execution-done-text">Realizado</div>
                </button>
            `;
        }
        
        return `
            <div class="exercicio-execution-screen">
                <div class="execution-header">
                    <button class="back-btn" onclick="TreinoManager.backToExercicioList()">
                        ←
                    </button>
                    <h2 class="execution-title">${ex.exercicio}</h2>
                </div>
                
                <div class="execution-info-row">
                    <div class="execution-info-item">
                        <span class="execution-info-label">Séries:</span>
                        <span class="execution-info-value">${info.series}</span>
                    </div>
                    <div class="execution-info-item">
                        <span class="execution-info-label">Descanso:</span>
                        <span class="execution-info-value">${info.descanso || '-'}</span>
                    </div>
                </div>
                
                <div class="execution-gif-container">
                    ${gifHTML}
                </div>
                
                <div class="execution-progress-circles">
                    ${progressCirclesHTML}
                </div>
                
                <div class="execution-timer-label">
                    ${timerLabelHTML}
                </div>
                
                <div class="execution-actions">
                    <button class="execution-action-btn" onclick="TreinoManager.openModal('execucao')">
                        <div class="execution-action-icon">📋</div>
                        <div class="execution-action-label">Execução</div>
                    </button>
                    <button class="execution-action-btn" onclick="TreinoManager.openModal('musculos')">
                        <div class="execution-action-icon">💪</div>
                        <div class="execution-action-label">Músculos</div>
                    </button>
                    <button class="execution-action-btn" onclick="TreinoManager.openModal('ampliar')">
                        <div class="execution-action-icon">🔍</div>
                        <div class="execution-action-label">Ampliar</div>
                    </button>
                    <button class="execution-action-btn" onclick="TreinoManager.openModal('carga')">
                        <div class="execution-action-icon">⚖️</div>
                        <div class="execution-action-label">Alterar Carga</div>
                    </button>
                </div>
                
                <div class="execution-bottom-controls">
                    <button class="execution-nav-arrow" 
                            ${this.currentExercicioIndex === 0 ? 'disabled' : ''}
                            onclick="TreinoManager.previousExercicio()">
                        ◀
                    </button>
                    
                    ${mainButtonHTML}
                    
                    <button class="execution-nav-arrow" 
                            ${this.currentExercicioIndex === this.exercicios.length - 1 ? 'disabled' : ''}
                            onclick="TreinoManager.nextExercicio()">
                        ▶
                    </button>
                </div>
            </div>
            
            <!-- Modais -->
            <div class="modal-overlay" id="modal-execucao" onclick="TreinoManager.closeModalOnOverlay(event, 'modal-execucao')">
                <div class="modal-content">
                    <button class="modal-close" onclick="TreinoManager.closeModal('modal-execucao')">×</button>
                    <h3 class="modal-title">Como Executar</h3>
                    <div class="modal-body">
                        ${instructionsHTML}
                    </div>
                </div>
            </div>
            
            <div class="modal-overlay" id="modal-musculos" onclick="TreinoManager.closeModalOnOverlay(event, 'modal-musculos')">
                <div class="modal-content">
                    <button class="modal-close" onclick="TreinoManager.closeModal('modal-musculos')">×</button>
                    <h3 class="modal-title">Músculos Trabalhados</h3>
                    <div class="modal-body">
                        <p><strong>Exercício:</strong> ${ex.exercicio}</p>
                        ${musclesHTML}
                    </div>
                </div>
            </div>
            
            <div class="modal-overlay modal-fullscreen" id="modal-ampliar" onclick="TreinoManager.closeModalOnOverlay(event, 'modal-ampliar')">
                <div class="modal-content">
                    <button class="modal-close" onclick="TreinoManager.closeModal('modal-ampliar')">×</button>
                    ${gifFullscreenHTML}
                </div>
            </div>
            
            <div class="modal-overlay" id="modal-carga" onclick="TreinoManager.closeModalOnOverlay(event, 'modal-carga')">
                <div class="modal-content">
                    <button class="modal-close" onclick="TreinoManager.closeModal('modal-carga')">×</button>
                    <h3 class="modal-title">Alterar Carga</h3>
                    <div class="modal-body">
                        <div class="modal-carga-input-group">
                            <label class="modal-carga-label">Carga Atual: ${carga}</label>
                            <input type="text" 
                                   class="modal-carga-input" 
                                   id="carga-input" 
                                   placeholder="Ex: 20kg ou 15 reps"
                                   value="${carga === '-' ? '' : carga}">
                        </div>
                        <button class="modal-carga-btn" onclick="TreinoManager.saveCarga()">
                            Salvar Carga
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Inicializa os listeners da tela de execução
     */
    initExecutionListeners() {
        // Se está em descanso, inicia o timer
        if (this.isResting && this.timerSeconds > 0) {
            this.startTimer();
        }
    },
    
    /**
     * Vai para uma série específica
     */
    goToSerie(serieNum) {
        const ex = this.exercicios[this.currentExercicioIndex];
        const info = this.parseExercicioInfo(ex.descricao);
        
        // Parar o timer se estiver rodando
        this.stopTimer();
        
        // Se clicar em uma série já completada ou a atual
        if (serieNum <= this.currentSerie) {
            this.currentSerie = serieNum;
            this.isResting = false;
            this.renderCurrentView();
        } else if (serieNum === this.currentSerie + 1) {
            // Próxima série - iniciar descanso
            this.completeSerie();
        }
    },
    
    /**
     * Completa a série atual e inicia o descanso
     */
    completeSerie() {
        const ex = this.exercicios[this.currentExercicioIndex];
        const info = this.parseExercicioInfo(ex.descricao);
        
        if (this.currentSerie >= info.seriesNum) {
            // Última série completada
            this.completeExercicio();
            return;
        }
        
        // Iniciar descanso
        this.isResting = true;
        this.timerSeconds = info.descansoSec;
        this.currentSerie++;
        this.renderCurrentView();
    },
    
    /**
     * Marca o exercício como completo
     */
    completeExercicio() {
        const ex = this.exercicios[this.currentExercicioIndex];
        const key = this.getExercicioKey(this.selectedDia, ex.exercicio);
        const progress = this.loadProgress();
        
        progress[key] = {
            completed: true,
            date: new Date().toISOString()
        };
        
        this.saveProgress(progress);
        
        // Se tem próximo exercício, avança
        if (this.currentExercicioIndex < this.exercicios.length - 1) {
            this.nextExercicio();
        } else {
            // Fim do treino - salvar no histórico
            this.saveTreinoCompleto();
            
            showToast('Treino Concluído! 🎉', 'Parabéns! Você completou todos os exercícios.', 'success');
            this.backToExercicioList();
        }
    },
    
    /**
     * Inicia o timer de descanso
     */
    startTimer() {
        this.stopTimer(); // Garante que não há timer rodando
        
        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            
            // Atualiza o display do timer no botão
            const timerEl = document.querySelector('.execution-done-timer');
            if (timerEl) {
                timerEl.textContent = this.formatTime(this.timerSeconds);
            }
            
            if (this.timerSeconds <= 0) {
                this.stopTimer();
                this.isResting = false;
                this.renderCurrentView();
                
                // Tocar um som ou notificação (opcional)
                showToast('Descanso Finalizado! ⏰', 'Hora da próxima série!', 'info');
            }
        }, 1000);
    },
    
    /**
     * Para o timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    /**
     * Pula o descanso e vai para a próxima série
     */
    skipRest() {
        this.stopTimer();
        this.isResting = false;
        this.renderCurrentView();
    },
    
    /**
     * Formata o tempo em mm:ss
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Volta para a lista de exercícios
     */
    backToExercicioList() {
        this.stopTimer();
        this.currentView = 'exercicio-list';
        this.renderCurrentView();
    },
    
    /**
     * Vai para o exercício anterior
     */
    previousExercicio() {
        if (this.currentExercicioIndex > 0) {
            this.stopTimer();
            this.currentExercicioIndex--;
            this.currentSerie = 1;
            this.isResting = false;
            this.renderCurrentView();
        }
    },
    
    /**
     * Vai para o próximo exercício
     */
    nextExercicio() {
        if (this.currentExercicioIndex < this.exercicios.length - 1) {
            this.stopTimer();
            this.currentExercicioIndex++;
            this.currentSerie = 1;
            this.isResting = false;
            this.renderCurrentView();
        }
    },
    
    /**
     * Abre um modal
     */
    openModal(modalType) {
        const modalId = `modal-${modalType}`;
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    },
    
    /**
     * Fecha um modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },
    
    /**
     * Fecha o modal ao clicar no overlay
     */
    closeModalOnOverlay(event, modalId) {
        if (event.target.classList.contains('modal-overlay')) {
            this.closeModal(modalId);
        }
    },
    
    /**
     * Salva a carga definida pelo usuário
     */
    saveCarga() {
        const input = document.getElementById('carga-input');
        const novaCarga = input.value.trim() || '-';
        
        const ex = this.exercicios[this.currentExercicioIndex];
        const key = this.getExercicioKey(this.selectedDia, ex.exercicio);
        
        const cargas = this.loadCargas();
        cargas[key] = novaCarga;
        this.saveCargas(cargas);
        
        this.closeModal('modal-carga');
        this.renderCurrentView();
        
        showToast('Carga Atualizada! ✅', 'A nova carga foi salva com sucesso.', 'success');
    },
    
    /**
     * Alterna o estado de conclusão de um exercício na lista
     */
    toggleExercicioComplete(key) {
        const progress = this.loadProgress();
        
        if (progress[key]?.completed) {
            delete progress[key];
        } else {
            progress[key] = {
                completed: true,
                date: new Date().toISOString()
            };
        }
        
        this.saveProgress(progress);
        this.renderCurrentView();
    },
    
    /**
     * Extrai informações do exercício (séries, repetições, descanso)
     */
    parseExercicioInfo(descricao) {
        const info = {
            series: '3',
            seriesNum: 3,
            repeticoes: '12',
            descanso: '60s',
            descansoSec: 60
        };
        
        // Extrair séries
        const seriesMatch = descricao.match(/(\d+)\s*(?:séries?|series?|sets?)/i);
        if (seriesMatch) {
            info.series = seriesMatch[1];
            info.seriesNum = parseInt(seriesMatch[1]);
        }
        
        // Extrair repetições
        const repsMatch = descricao.match(/(\d+(?:-\d+)?)\s*(?:repetições?|reps?|rep)/i);
        if (repsMatch) {
            info.repeticoes = repsMatch[1];
        }
        
        // Extrair descanso
        const descansoMatch = descricao.match(/(\d+)\s*(?:segundos?|seg|s)\s*(?:de\s*)?(?:descanso|intervalo)/i);
        if (descansoMatch) {
            info.descansoSec = parseInt(descansoMatch[1]);
            info.descanso = `${info.descansoSec}s`;
        }
        
        return info;
    },
    
    /**
     * Extrai os músculos trabalhados de uma lista de exercícios
     */
    extrairMusculos(exercicios) {
        const gruposMusculares = {
            'Peito': ['supino', 'peck', 'crucifixo', 'flexão', 'chest', 'peitoral'],
            'Costas': ['puxada', 'remada', 'barra fixa', 'pulldown', 'dorsal', 'costas'],
            'Pernas': ['agachamento', 'leg press', 'cadeira', 'stiff', 'panturrilha', 'coxa', 'glúteo', 'perna'],
            'Ombros': ['desenvolvimento', 'elevação', 'shoulder', 'ombro', 'deltoide'],
            'Bíceps': ['rosca', 'bíceps', 'biceps'],
            'Tríceps': ['tríceps', 'triceps', 'mergulho', 'testa', 'francês'],
            'Abdômen': ['abdominal', 'prancha', 'crunch', 'abs', 'core'],
            'Cardio': ['cardio', 'corrida', 'esteira', 'bicicleta', 'bike', 'aeróbico']
        };
        
        const encontrados = new Set();
        
        exercicios.forEach(ex => {
            const texto = (ex.exercicio + ' ' + ex.descricao).toLowerCase();
            
            for (const [grupo, palavras] of Object.entries(gruposMusculares)) {
                if (palavras.some(palavra => texto.includes(palavra))) {
                    encontrados.add(grupo);
                }
            }
        });
        
        return Array.from(encontrados);
    },
    
    /**
     * Alterna a visualização do histórico
     */
    toggleHistorico() {
        if (this.currentView === 'historico') {
            this.currentView = 'dia-selection';
        } else {
            this.currentView = 'historico';
        }
        this.renderCurrentView();
    },
    
    /**
     * Carrega o histórico de treinos
     */
    loadHistorico() {
        const email = this.getUserEmail();
        const key = `treinoHistorico_${email}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    },
    
    /**
     * Salva um treino no histórico
     */
    saveToHistorico(diaCompleto) {
        const email = this.getUserEmail();
        const key = `treinoHistorico_${email}`;
        const historico = this.loadHistorico();
        
        const registro = {
            date: new Date().toISOString(),
            dia: diaCompleto.dia,
            exercicios: diaCompleto.exercicios.map(ex => ({
                nome: ex.nome,
                carga: ex.carga || '-'
            }))
        };
        
        historico.unshift(registro); // Adiciona no início
        
        // Limita a 50 registros
        if (historico.length > 50) {
            historico.pop();
        }
        
        localStorage.setItem(key, JSON.stringify(historico));
    },
    
    /**
     * Renderiza a tela de histórico
     */
    renderHistorico() {
        const historico = this.loadHistorico();
        
        if (historico.length === 0) {
            return `
                <div class="historico-screen">
                    <div class="historico-header">
                        <button class="back-btn" onclick="TreinoManager.toggleHistorico()">
                            ←
                        </button>
                        <h2 class="historico-title">Histórico de Treinos</h2>
                    </div>
                    <div class="historico-empty">
                        📊 Nenhum treino registrado ainda.<br>
                        Complete seus treinos para vê-los aqui!
                    </div>
                </div>
            `;
        }
        
        let historicoHTML = '';
        
        historico.forEach(registro => {
            const date = new Date(registro.date);
            const dataFormatada = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            let exerciciosHTML = '';
            registro.exercicios.forEach(ex => {
                exerciciosHTML += `
                    <div class="historico-exercicio-item">
                        <span class="historico-exercicio-nome">${ex.nome}</span>
                        <span class="historico-exercicio-carga">${ex.carga}</span>
                    </div>
                `;
            });
            
            historicoHTML += `
                <div class="historico-card">
                    <div class="historico-card-date">🕒 ${dataFormatada}</div>
                    <div class="historico-card-dia">💪 ${registro.dia}</div>
                    <div class="historico-card-exercicios">
                        ${exerciciosHTML}
                    </div>
                </div>
            `;
        });
        
        return `
            <div class="historico-screen">
                <div class="historico-header">
                    <button class="back-btn" onclick="TreinoManager.toggleHistorico()">
                        ←
                    </button>
                    <h2 class="historico-title">Histórico de Treinos</h2>
                </div>
                <div class="historico-grid">
                    ${historicoHTML}
                </div>
            </div>
        `;
    },
    
    /**
     * Salva o treino atual no histórico quando completo
     */
    saveTreinoCompleto() {
        const cargas = this.loadCargas();
        
        const diaCompleto = {
            dia: this.selectedDia,
            exercicios: this.exercicios.map(ex => {
                const key = this.getExercicioKey(this.selectedDia, ex.exercicio);
                return {
                    nome: ex.exercicio,
                    carga: cargas[key] || '-'
                };
            })
        };
        
        this.saveToHistorico(diaCompleto);
    },
    
    /**
     * Abre a seção de exercícios de Cardio
     */
    abrirCardio() {
        // Carrega todos os exercícios de cardio do JSON
        if (typeof LocalExerciseService !== 'undefined') {
            const todosExercicios = LocalExerciseService.exercises || [];
            const exerciciosCardio = todosExercicios.filter(ex => 
                ex.bodyParts && ex.bodyParts.includes('Cardio')
            );
            
            if (exerciciosCardio.length === 0) {
                showToast('Sem Exercícios ⚠️', 'Nenhum exercício de cardio encontrado no banco de dados.', 'warning');
                return;
            }
            
            // Define estado para cardio
            this.currentView = 'cardio-list';
            this.selectedDia = 'Cardio';
            this.exerciciosCardio = exerciciosCardio;
            
            // Renderiza a tela de cardio
            this.renderCardioScreen();
        } else {
            showToast('Erro ao Carregar ❌', 'Não foi possível carregar os exercícios. Recarregue a página.', 'error');
        }
    },
    
    /**
     * Renderiza a tela de seleção de cardio
     */
    renderCardioScreen() {
        const container = document.getElementById('treino-main-container');
        
        let cardioHTML = `
            <div class="cardio-screen" style="animation: fadeIn 0.3s ease;">
                <div class="exercicio-list-header">
                    <button class="back-btn" onclick="TreinoManager.voltarParaDiaSelection()">←</button>
                    <div>
                        <h2 class="exercicio-list-title">🏃 Cardio</h2>
                        <p class="exercicio-list-subtitle">Escolha seu exercício cardiovascular</p>
                    </div>
                </div>
                
                <div class="cardio-info-box" style="
                    background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-left: 4px solid #FF6B35;
                ">
                    <h3 style="margin: 0 0 10px 0; color: #E65100; font-size: 1.1rem;">💡 Dicas de Cardio</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #E65100; line-height: 1.8;">
                        <li>Faça cardio em dias separados ou após o treino de musculação</li>
                        <li>Iniciantes: 20-30 minutos em intensidade moderada</li>
                        <li>Avançados: 30-45 minutos ou treinos intervalados (HIIT)</li>
                        <li>Mantenha-se hidratado durante todo o exercício</li>
                    </ul>
                </div>
                
                <div class="cardio-categories">
        `;
        
        // Separa por local (academia/casa)
        const academia = this.exerciciosCardio.filter(ex => ex.location === 'academia');
        const casa = this.exerciciosCardio.filter(ex => ex.location === 'casa');
        
        // Renderiza academia
        if (academia.length > 0) {
            cardioHTML += `
                <h3 style="color: var(--text-color); margin: 20px 0 15px 0; font-size: 1.2rem;">
                    🏋️ Academia
                </h3>
                <div class="exercicio-grid">
            `;
            
            academia.forEach(ex => {
                const gifUrl = `/exercises_gifs/${ex.gifUrl}`;
                cardioHTML += `
                    <div class="exercicio-card" onclick="TreinoManager.iniciarCardioExercicio('${ex.id}')">
                        <div class="exercicio-gif-container">
                            <img src="${gifUrl}" 
                                 alt="${ex.name}" 
                                 class="exercicio-gif"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="exercicio-gif-fallback" style="display:none;">🏃</div>
                        </div>
                        <div class="exercicio-info">
                            <div class="exercicio-nome">${ex.name}</div>
                            <div class="exercicio-musculos">${ex.targetMuscles.join(', ')}</div>
                        </div>
                    </div>
                `;
            });
            
            cardioHTML += `</div>`;
        }
        
        // Renderiza casa
        if (casa.length > 0) {
            cardioHTML += `
                <h3 style="color: var(--text-color); margin: 30px 0 15px 0; font-size: 1.2rem;">
                    🏠 Casa
                </h3>
                <div class="exercicio-grid">
            `;
            
            casa.forEach(ex => {
                const gifUrl = `/exercises_gifs/${ex.gifUrl}`;
                cardioHTML += `
                    <div class="exercicio-card" onclick="TreinoManager.iniciarCardioExercicio('${ex.id}')">
                        <div class="exercicio-gif-container">
                            <img src="${gifUrl}" 
                                 alt="${ex.name}" 
                                 class="exercicio-gif"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="exercicio-gif-fallback" style="display:none;">🏃</div>
                        </div>
                        <div class="exercicio-info">
                            <div class="exercicio-nome">${ex.name}</div>
                            <div class="exercicio-musculos">${ex.targetMuscles.join(', ')}</div>
                        </div>
                    </div>
                `;
            });
            
            cardioHTML += `</div>`;
        }
        
        cardioHTML += `
                </div>
            </div>
        `;
        
        container.innerHTML = cardioHTML;
    },
    
    /**
     * Inicia um exercício de cardio individual
     */
    iniciarCardioExercicio(exercicioId) {
        const exercicio = this.exerciciosCardio.find(ex => ex.id === exercicioId);
        if (!exercicio) return;
        
        // Cria modal de execução simplificado para cardio
        const gifUrl = `/exercises_gifs/${exercicio.gifUrl}`;
        
        let instructionsHTML = '<ol class="exercise-instructions">';
        exercicio.instructions.forEach(instruction => {
            instructionsHTML += `<li>${instruction}</li>`;
        });
        instructionsHTML += '</ol>';
        
        const modalHTML = `
            <div class="modal-overlay" onclick="this.remove()" style="
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            ">
                <div class="cardio-modal" onclick="event.stopPropagation()" style="
                    background: white;
                    border-radius: 16px;
                    padding: 25px;
                    max-width: 500px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                ">
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        float: right;
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #999;
                    ">×</button>
                    
                    <h2 style="color: var(--primary-color); margin: 0 0 15px 0;">
                        🏃 ${exercicio.name}
                    </h2>
                    
                    <div style="margin: 20px 0;">
                        <img src="${gifUrl}" 
                             alt="${exercicio.name}"
                             style="width: 100%; border-radius: 12px; max-height: 300px; object-fit: contain; background: #f5f5f5;"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><text x=%2250%%25%22 y=%2250%%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22>🏃</text></svg>'">
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 0 0 5px 0; color: #666; font-weight: 600;">💪 Músculos Trabalhados:</p>
                        <p style="margin: 0; color: #333;">${exercicio.targetMuscles.join(', ')}</p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h3 style="color: #333; font-size: 1.1rem; margin-bottom: 10px;">📋 Como Fazer:</h3>
                        ${instructionsHTML}
                    </div>
                    
                    <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; border-left: 4px solid #FF6B35;">
                        <p style="margin: 0; color: #E65100; font-weight: 600;">⏱️ Duração Recomendada:</p>
                        <p style="margin: 5px 0 0 0; color: #E65100;">
                            Iniciante: 15-20 min | Intermediário: 25-35 min | Avançado: 40-50 min
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    /**
     * Volta para a seleção de dias
     */
    voltarParaDiaSelection() {
        this.currentView = 'dia-selection';
        this.selectedDia = null;
        this.renderCurrentView();
    },
    
    /**
     * Abre o chat de treinos
     */
    abrirChatTreino() {
        this.currentView = 'chat-treino';
        this.renderCurrentView();
        
        // Inicializa listeners do chat após renderizar
        setTimeout(() => {
            this.initChatTreinoListeners();
        }, 100);
    },
    
    /**
     * Renderiza a tela de chat de treinos
     */
    renderChatTreino() {
        const sugestoes = [
            'Trocar exercício',
            'Adicionar exercícios',
            'Remover exercício',
            'Alterar séries'
        ];
        
        let suggestoesHTML = '';
        sugestoes.forEach(sugestao => {
            suggestoesHTML += `
                <button class="chat-sugestao-btn" onclick="TreinoManager.usarSugestao('${sugestao}')">
                    ${sugestao}
                </button>
            `;
        });
        
        return `
            <div class="chat-treino-screen">
                <div class="exercicio-list-header">
                    <button class="back-btn" onclick="TreinoManager.voltarParaDiaSelection()">←</button>
                    <div>
                        <h2 class="exercicio-list-title">💬 Chat de Treinos</h2>
                        <p class="exercicio-list-subtitle">Personalize seu treino</p>
                    </div>
                </div>
                
                <div class="chat-treino-messages" id="chat-treino-messages">
                    <div class="chat-message chat-message-ia">
                        <div class="chat-message-content">
                            Olá! Como posso ajudar com seu treino?
                        </div>
                    </div>
                </div>
                
                <div class="chat-treino-sugestoes">
                    ${suggestoesHTML}
                </div>
                
                <div class="chat-treino-input-container">
                    <textarea 
                        id="chat-treino-input" 
                        class="chat-treino-input" 
                        placeholder="Digite sua mensagem..."
                        rows="1"
                    ></textarea>
                    <button class="chat-treino-send-btn" id="chat-treino-send-btn">
                        ➤
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * Inicializa os listeners do chat de treinos
     */
    initChatTreinoListeners() {
        const input = document.getElementById('chat-treino-input');
        const sendBtn = document.getElementById('chat-treino-send-btn');
        
        if (!input || !sendBtn) return;
        
        // Auto-resize textarea
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        // Enviar com Enter (Shift+Enter para nova linha)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.enviarMensagemChatTreino();
            }
        });
        
        // Botão enviar
        sendBtn.addEventListener('click', () => {
            this.enviarMensagemChatTreino();
        });
    },
    
    /**
     * Usa uma sugestão pré-definida
     */
    usarSugestao(sugestao) {
        const input = document.getElementById('chat-treino-input');
        if (input) {
            input.value = sugestao;
            input.focus();
        }
    },
    
    /**
     * Envia mensagem no chat de treinos
     */
    async enviarMensagemChatTreino() {
        const input = document.getElementById('chat-treino-input');
        const messagesContainer = document.getElementById('chat-treino-messages');
        
        if (!input || !messagesContainer) return;
        
        const mensagem = input.value.trim();
        if (!mensagem) return;
        
        // Adiciona mensagem do usuário
        const userMessageHTML = `
            <div class="chat-message chat-message-user">
                <div class="chat-message-content">${mensagem}</div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', userMessageHTML);
        
        // Limpa input
        input.value = '';
        input.style.height = 'auto';
        
        // Scroll para o final
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Adiciona indicador de digitação
        const typingHTML = `
            <div class="chat-message chat-message-ia chat-typing" id="chat-typing">
                <div class="chat-message-content">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Simula resposta da IA (aqui você pode integrar com o backend)
        setTimeout(() => {
            const typingElement = document.getElementById('chat-typing');
            if (typingElement) typingElement.remove();
            
            const iaResponse = this.gerarRespostaChatTreino(mensagem);
            const iaMessageHTML = `
                <div class="chat-message chat-message-ia">
                    <div class="chat-message-content">${iaResponse}</div>
                </div>
            `;
            messagesContainer.insertAdjacentHTML('beforeend', iaMessageHTML);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1500);
    },
    
    /**
     * Gera resposta do chat de treinos (placeholder - pode ser integrado com IA real)
     */
    gerarRespostaChatTreino(mensagem) {
        const msgLower = mensagem.toLowerCase();
        
        if (msgLower.includes('trocar') || msgLower.includes('substituir')) {
            return 'Entendido! Para trocar um exercício, me diga qual exercício você quer substituir e por qual você gostaria de substituí-lo. Por exemplo: "Trocar supino reto por supino inclinado".';
        } else if (msgLower.includes('adicionar')) {
            return 'Ótimo! Para adicionar exercícios, me diga em qual dia você quer adicionar e qual exercício. Por exemplo: "Adicionar rosca direta na segunda-feira".';
        } else if (msgLower.includes('remover') || msgLower.includes('tirar')) {
            return 'Certo! Me diga qual exercício você quer remover e de qual dia. Por exemplo: "Remover leg press da quarta-feira".';
        } else if (msgLower.includes('séries') || msgLower.includes('series') || msgLower.includes('repetições') || msgLower.includes('repeticoes')) {
            return 'Para alterar séries e repetições, me diga o exercício e os novos valores. Por exemplo: "Mudar supino para 4 séries de 10 repetições".';
        } else if (msgLower.includes('ordem')) {
            return 'Para mudar a ordem dos exercícios, me diga qual exercício quer mover e para qual posição. Por exemplo: "Mover puxada frontal para antes da remada".';
        } else {
            return 'Entendi! Para modificar seu treino, você pode:\n\n🔄 Trocar exercícios\n➕ Adicionar novos exercícios\n➖ Remover exercícios\n📊 Alterar séries e repetições\n↕️ Mudar a ordem\n\nMe diga o que você gostaria de fazer!';
        }
    }
};

