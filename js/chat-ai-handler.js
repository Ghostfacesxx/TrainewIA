/**
 * Chat AI Handler
 * Sistema inteligente para processar mensagens sobre treinos e alimentação
 */

const ChatAIHandler = {
    /**
     * Palavras-chave para detecção de contexto
     */
    keywords: {
        treino: [
            'treino', 'exercício', 'exercicio', 'musculação', 'musculacao',
            'academia', 'série', 'serie', 'repetição', 'repeticao',
            'supino', 'agachamento', 'rosca', 'puxada', 'remada',
            'leg press', 'desenvolvimento', 'crucifixo', 'stiff',
            'como fazer', 'como executar', 'execução', 'execucao',
            'técnica', 'tecnica', 'forma correta', 'postura',
            'montar treino', 'criar treino', 'gerar treino', 'divisão',
            'ficha', 'ficha de treino', 'rotina', 'programa'
        ],
        alimentacao: [
            'dieta', 'alimentação', 'alimentacao', 'comida', 'nutrição', 'nutricao',
            'proteína', 'proteina', 'carboidrato', 'gordura',
            'caloria', 'calorias', 'emagrecer', 'ganhar massa',
            'bulking', 'cutting', 'deficit', 'superavit',
            'refeição', 'refeicao', 'café da manhã', 'almoço', 'almoco',
            'janta', 'lanche', 'pré-treino', 'pós-treino', 'suplemento'
        ],
        videoHelp: [
            'como fazer', 'como executar', 'me ensina', 'ensine',
            'tutorial', 'vídeo', 'video', 'demonstração', 'demonstracao',
            'me mostre', 'mostre', 'exemplo', 'aprende', 'aprender'
        ],
        gerarTreino: [
            'montar treino', 'criar treino', 'gerar treino', 'monte um treino',
            'crie um treino', 'preciso de um treino', 'quero um treino',
            'fazer treino', 'divisão de treino', 'rotina', 'programa de treino'
        ]
    },

    /**
     * Base de conhecimento sobre exercícios
     */
    exerciseKnowledge: {
        'supino': {
            musculos: 'peitoral, tríceps e ombros',
            passos: [
                'Deite no banco com os pés firmes no chão',
                'Segure a barra na largura dos ombros',
                'Desça a barra até tocar no peito (controle o movimento)',
                'Empurre a barra de volta até esticar os braços',
                'Mantenha as costas apoiadas durante todo o exercício'
            ],
            erroComum: 'Não tire o quadril do banco e não balance a barra',
            comum: ['supino reto', 'supino inclinado', 'supino declinado']
        },
        'agachamento': {
            musculos: 'pernas (coxa, glúteos) e abdômen',
            passos: [
                'Fique em pé com os pés na largura dos ombros',
                'Mantenha as costas retas olhando para frente',
                'Desça dobrando os joelhos como se fosse sentar',
                'Desça até a coxa ficar paralela ao chão',
                'Suba empurrando pelo calcanhar'
            ],
            erroComum: 'Não deixe os joelhos passarem muito à frente dos pés',
            comum: ['agachamento livre', 'agachamento sumô', 'agachamento búlgaro']
        },
        'rosca': {
            musculos: 'bíceps (parte da frente do braço)',
            passos: [
                'Fique em pé segurando os halteres ou barra',
                'Mantenha os cotovelos fixos na lateral do corpo',
                'Dobre os cotovelos levantando o peso',
                'Suba até os bíceps ficarem totalmente contraídos',
                'Desça controladamente até esticar os braços'
            ],
            erroComum: 'Não balance o corpo para pegar impulso',
            comum: ['rosca direta', 'rosca alternada', 'rosca martelo', 'rosca scott']
        },
        'puxada': {
            musculos: 'costas e bíceps',
            passos: [
                'Sente na máquina e segure a barra acima da cabeça',
                'Mantenha o peito estufado e costas retas',
                'Puxe a barra em direção ao peito',
                'Aperte as costas quando a barra estiver embaixo',
                'Suba controladamente até esticar os braços'
            ],
            erroComum: 'Não puxe só com os braços, use as costas',
            comum: ['puxada frontal', 'puxada aberta', 'puxada fechada']
        },
        'remada': {
            musculos: 'costas (meio das costas)',
            passos: [
                'Incline o tronco para frente (45 graus) ou sente na máquina',
                'Segure a barra ou cabos com os braços estendidos',
                'Puxe em direção ao abdômen mantendo cotovelos perto do corpo',
                'Aperte as costas juntando as escápulas',
                'Volte controladamente à posição inicial'
            ],
            erroComum: 'Mantenha as costas retas, não arredonde',
            comum: ['remada curvada', 'remada sentada', 'remada unilateral']
        },
        'leg press': {
            musculos: 'pernas completas (coxa e glúteos)',
            passos: [
                'Sente na máquina com as costas apoiadas',
                'Coloque os pés na plataforma na largura dos ombros',
                'Destrave a máquina e dobre os joelhos',
                'Desça até formar 90 graus nos joelhos',
                'Empurre de volta até quase esticar as pernas'
            ],
            erroComum: 'Não tire o quadril do assento ao descer',
            comum: ['leg press 45', 'leg press horizontal']
        },
        'desenvolvimento': {
            musculos: 'ombros e tríceps',
            passos: [
                'Sente com as costas retas ou fique em pé',
                'Segure os halteres ou barra na altura dos ombros',
                'Empurre para cima até esticar os braços',
                'Desça controladamente até a posição inicial',
                'Mantenha o abdômen contraído'
            ],
            erroComum: 'Não arqueie as costas ao empurrar',
            comum: ['desenvolvimento militar', 'desenvolvimento arnold', 'desenvolvimento máquina']
        },
        'crucifixo': {
            musculos: 'peitoral (peito)',
            passos: [
                'Deite no banco segurando halteres acima do peito',
                'Mantenha os cotovelos levemente dobrados',
                'Abra os braços para os lados descendo os pesos',
                'Desça até sentir alongamento no peito',
                'Volte juntando os braços acima do peito'
            ],
            erroComum: 'Não estique completamente os cotovelos',
            comum: ['crucifixo reto', 'crucifixo inclinado', 'crucifixo na polia']
        },
        'stiff': {
            musculos: 'parte de trás da coxa e glúteos',
            passos: [
                'Fique em pé segurando a barra ou halteres',
                'Mantenha os joelhos levemente dobrados',
                'Desça empinando o bumbum para trás',
                'Mantenha as costas retas (não arredonde)',
                'Suba contraindo o glúteo'
            ],
            erroComum: 'Não force as costas, o movimento vem do quadril',
            comum: ['stiff com barra', 'stiff com halteres', 'stiff unilateral']
        },
        'tríceps': {
            musculos: 'tríceps (parte de trás do braço)',
            passos: [
                'Posicione-se de acordo com o exercício (deitado, em pé, etc)',
                'Mantenha os cotovelos fixos e próximos ao corpo',
                'Estenda os braços empurrando o peso',
                'Contraia o tríceps quando esticar',
                'Volte controladamente dobrando os cotovelos'
            ],
            erroComum: 'Não deixe os cotovelos abrirem para os lados',
            comum: ['tríceps testa', 'tríceps corda', 'tríceps mergulho', 'tríceps francês']
        },
        'abdominal': {
            musculos: 'abdômen (barriga)',
            passos: [
                'Deite de costas com os joelhos dobrados',
                'Coloque as mãos atrás da cabeça ou no peito',
                'Levante o tronco contraindo o abdômen',
                'Suba até as escápulas saírem do chão',
                'Desça controladamente sem relaxar completamente'
            ],
            erroComum: 'Não puxe o pescoço com as mãos',
            comum: ['abdominal supra', 'abdominal infra', 'prancha', 'bicicleta']
        },
        'prancha': {
            musculos: 'abdômen completo e core',
            passos: [
                'Deite de barriga para baixo',
                'Apoie-se nos antebraços e pontas dos pés',
                'Mantenha o corpo reto como uma tábua',
                'Contraia o abdômen durante todo o tempo',
                'Segure a posição sem deixar o quadril cair'
            ],
            erroComum: 'Não deixe o quadril subir ou descer demais',
            comum: ['prancha frontal', 'prancha lateral']
        },
        'flexão': {
            musculos: 'peitoral, tríceps e ombros',
            passos: [
                'Coloque as mãos no chão na largura dos ombros',
                'Estique as pernas apoiando nas pontas dos pés',
                'Mantenha o corpo reto como uma tábua',
                'Desça dobrando os cotovelos até o peito quase tocar o chão',
                'Empurre de volta até esticar os braços'
            ],
            erroComum: 'Não deixe o quadril cair ou subir demais',
            comum: ['flexão tradicional', 'flexão diamante', 'flexão archer']
        },
        'elevação lateral': {
            musculos: 'ombros (lateral)',
            passos: [
                'Fique em pé segurando halteres nas laterais do corpo',
                'Mantenha os cotovelos levemente dobrados',
                'Levante os braços para os lados',
                'Suba até a altura dos ombros',
                'Desça controladamente'
            ],
            erroComum: 'Não use impulso, faça o movimento controlado',
            comum: ['elevação lateral com halteres', 'elevação lateral no cabo']
        },
        'cadeira extensora': {
            musculos: 'frente da coxa (quadríceps)',
            passos: [
                'Sente na máquina com as costas apoiadas',
                'Coloque as canelas atrás do rolo',
                'Segure nas alças laterais',
                'Estique as pernas levantando o peso',
                'Desça controladamente até dobrar os joelhos'
            ],
            erroComum: 'Não faça o movimento muito rápido',
            comum: ['cadeira extensora']
        },
        'cadeira flexora': {
            musculos: 'parte de trás da coxa',
            passos: [
                'Deite de barriga para baixo na máquina',
                'Coloque os calcanhares sob o rolo',
                'Segure nas alças',
                'Dobre as pernas trazendo o peso em direção ao bumbum',
                'Volte controladamente estendendo as pernas'
            ],
            erroComum: 'Não tire o quadril do banco',
            comum: ['cadeira flexora deitada', 'cadeira flexora sentada']
        }
    },

    /**
     * Base de conhecimento sobre alimentação
     */
    nutritionKnowledge: {
        'proteína': {
            info: 'Essencial para construção muscular. Fontes: frango, peixe, carne vermelha, ovos, whey protein.',
            quantidade: '1.6-2.2g por kg de peso corporal para hipertrofia'
        },
        'carboidrato': {
            info: 'Principal fonte de energia. Prefira complexos: batata doce, arroz integral, aveia, pão integral.',
            quantidade: '3-5g por kg para manutenção, 5-7g para ganho de massa'
        },
        'gordura': {
            info: 'Importante para hormônios. Fontes saudáveis: abacate, azeite, castanhas, salmão, ovos.',
            quantidade: '0.8-1g por kg de peso corporal'
        },
        'pré-treino': {
            info: 'Carboidrato 1-2h antes para energia. Exemplos: banana com aveia, pão com pasta de amendoim, batata doce.',
            timing: '30min-2h antes do treino'
        },
        'pós-treino': {
            info: 'Proteína + carboidrato para recuperação. Exemplos: whey + banana, frango com arroz, ovo com pão.',
            timing: 'Até 2h após o treino'
        },
        'emagrecer': {
            info: 'Déficit calórico de 300-500 calorias. Mantenha proteína alta (2g/kg), reduza carboidratos gradualmente.',
            dica: 'Perca no máximo 0.5-1kg por semana'
        },
        'ganhar massa': {
            info: 'Superávit de 300-500 calorias. Alta proteína (2g/kg) e carboidratos suficientes para energia nos treinos.',
            dica: 'Ganhe no máximo 0.5kg por semana para minimizar gordura'
        }
    },

    /**
     * Detecta o contexto da mensagem
     */
    detectContext(message) {
        const msgLower = message.toLowerCase();
        
        const contexts = {
            treino: false,
            alimentacao: false,
            videoHelp: false,
            exercicio: null,
            gerarTreino: false
        };

        // Detecta contexto de treino
        contexts.treino = this.keywords.treino.some(kw => msgLower.includes(kw));
        
        // Detecta contexto de alimentação
        contexts.alimentacao = this.keywords.alimentacao.some(kw => msgLower.includes(kw));
        
        // Detecta pedido de vídeo
        contexts.videoHelp = this.keywords.videoHelp.some(kw => msgLower.includes(kw));
        
        // Detecta pedido para gerar treino
        contexts.gerarTreino = this.keywords.gerarTreino.some(kw => msgLower.includes(kw));
        
        // Detecta exercício específico
        for (const [exercicio, _] of Object.entries(this.exerciseKnowledge)) {
            if (msgLower.includes(exercicio)) {
                contexts.exercicio = exercicio;
                break;
            }
        }

        return contexts;
    },

    /**
     * Gera URL de vídeo do YouTube para um exercício
     */
    getYouTubeVideoUrl(exerciseName) {
        // Normaliza o nome do exercício
        const normalizedName = exerciseName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        // Mapeamento de exercícios para buscas específicas no YouTube
        const searchQueries = {
            'supino': 'supino+reto+como+fazer+correto',
            'supino reto': 'supino+reto+técnica+correta',
            'supino inclinado': 'supino+inclinado+execução',
            'agachamento': 'agachamento+livre+forma+correta',
            'agachamento livre': 'agachamento+livre+técnica',
            'rosca': 'rosca+direta+bíceps+forma+correta',
            'rosca direta': 'rosca+direta+execução+perfeita',
            'rosca alternada': 'rosca+alternada+halteres',
            'rosca martelo': 'rosca+martelo+técnica',
            'puxada': 'puxada+frontal+costas+execução',
            'puxada frontal': 'puxada+frontal+forma+correta',
            'remada': 'remada+curvada+costas+técnica',
            'remada curvada': 'remada+curvada+execução',
            'leg press': 'leg+press+45+graus+forma+correta',
            'desenvolvimento': 'desenvolvimento+militar+ombros',
            'crucifixo': 'crucifixo+reto+peitoral+execução',
            'stiff': 'stiff+posterior+coxa+técnica',
            'tríceps': 'tríceps+testa+execução+correta',
            'tríceps testa': 'tríceps+testa+forma+perfeita',
            'tríceps corda': 'tríceps+corda+polia+execução'
        };

        const searchQuery = searchQueries[normalizedName] || `${exerciseName.replace(/\s+/g, '+')}+como+fazer+correto`;
        return `https://www.youtube.com/results?search_query=${searchQuery}`;
    },

    /**
     * Gera treino personalizado baseado nos dados do usuário
     */
    async generateWorkoutPlan(userPreferences) {
        const {
            diasDisponiveis = 3,
            local = 'academia', // 'academia', 'casa', ou 'ambos'
            objetivo = 'hipertrofia',
            nivel = 'intermediario',
            restricoes = [],
            tempoDisponivel = 'medio' // 'curto' (30-45min), 'medio' (60min), 'longo' (90min+)
        } = userPreferences;

        // Carrega exercícios do JSON
        let exercises = [];
        try {
            const response = await fetch('exercises_gifs/exercises.json');
            exercises = await response.json();
        } catch (error) {
            console.error('Erro ao carregar exercícios:', error);
            return null;
        }

        // Filtra exercícios por localização
        let availableExercises = exercises;
        if (local === 'academia') {
            availableExercises = exercises.filter(ex => ex.location === 'academia');
        } else if (local === 'casa') {
            availableExercises = exercises.filter(ex => ex.location === 'casa');
        }
        // Se local === 'ambos', usa todos os exercícios

        // Remove exercícios com restrições
        if (restricoes.length > 0) {
            availableExercises = availableExercises.filter(ex => {
                return !restricoes.some(restricao => 
                    ex.bodyParts.some(part => part.toLowerCase().includes(restricao.toLowerCase()))
                );
            });
        }

        // Define divisão de treino baseada nos dias disponíveis
        let treinoDivisao = this.getWorkoutSplit(diasDisponiveis);
        
        // Gera os treinos
        const workoutPlan = treinoDivisao.map(dia => {
            return this.createWorkoutDay(dia, availableExercises, nivel, tempoDisponivel, local);
        });

        return {
            diasPorSemana: diasDisponiveis,
            divisao: treinoDivisao.map(d => d.nome),
            treinos: workoutPlan,
            observacoes: this.getWorkoutNotes(objetivo, nivel, local)
        };
    },

    /**
     * Define a divisão de treino baseada nos dias disponíveis
     */
    getWorkoutSplit(dias) {
        const splits = {
            2: [
                { nome: 'Treino A - Superior', grupos: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'] },
                { nome: 'Treino B - Inferior + Core', grupos: ['Pernas', 'Glúteos', 'Panturrilha', 'Abdômen'] }
            ],
            3: [
                { nome: 'Treino A - Push (Empurrar)', grupos: ['Peito', 'Ombros', 'Tríceps'] },
                { nome: 'Treino B - Pull (Puxar)', grupos: ['Costas', 'Bíceps'] },
                { nome: 'Treino C - Legs (Pernas)', grupos: ['Pernas', 'Glúteos', 'Panturrilha', 'Abdômen'] }
            ],
            4: [
                { nome: 'Treino A - Peito + Tríceps', grupos: ['Peito', 'Tríceps', 'Abdômen'] },
                { nome: 'Treino B - Costas + Bíceps', grupos: ['Costas', 'Bíceps'] },
                { nome: 'Treino C - Pernas', grupos: ['Pernas', 'Glúteos', 'Panturrilha'] },
                { nome: 'Treino D - Ombros + Core', grupos: ['Ombros', 'Abdômen', 'Panturrilha'] }
            ],
            5: [
                { nome: 'Treino A - Peito', grupos: ['Peito', 'Abdômen'] },
                { nome: 'Treino B - Costas', grupos: ['Costas'] },
                { nome: 'Treino C - Pernas', grupos: ['Pernas', 'Glúteos'] },
                { nome: 'Treino D - Ombros', grupos: ['Ombros', 'Panturrilha'] },
                { nome: 'Treino E - Braços', grupos: ['Bíceps', 'Tríceps', 'Abdômen'] }
            ],
            6: [
                { nome: 'Treino A - Peito + Tríceps', grupos: ['Peito', 'Tríceps'] },
                { nome: 'Treino B - Costas + Bíceps', grupos: ['Costas', 'Bíceps'] },
                { nome: 'Treino C - Pernas (Quadríceps)', grupos: ['Pernas', 'Abdômen'] },
                { nome: 'Treino D - Ombros', grupos: ['Ombros', 'Panturrilha'] },
                { nome: 'Treino E - Pernas (Posterior)', grupos: ['Glúteos', 'Pernas'] },
                { nome: 'Treino F - Braços + Core', grupos: ['Bíceps', 'Tríceps', 'Abdômen'] }
            ]
        };

        // Se dias > 6 ou < 2, usa divisão de 3 dias
        return splits[dias] || splits[3];
    },

    /**
     * Cria um dia de treino completo
     */
    createWorkoutDay(diaConfig, exercises, nivel, tempoDisponivel, local) {
        const { nome, grupos } = diaConfig;
        const workout = {
            nome,
            grupos,
            exercicios: []
        };

        // Define número de exercícios por grupo baseado no tempo
        const exerciciosPorGrupo = {
            'curto': 2,
            'medio': 3,
            'longo': 4
        };
        const numExercicios = exerciciosPorGrupo[tempoDisponivel] || 3;

        // Para cada grupo muscular, seleciona exercícios
        grupos.forEach(grupo => {
            const grupoExercises = exercises.filter(ex => 
                ex.bodyParts.includes(grupo)
            );

            // Seleciona exercícios variados
            const selected = this.selectVariedExercises(grupoExercises, numExercicios, local);
            
            selected.forEach(ex => {
                const seriesReps = this.getSeriesReps(nivel, grupo);
                workout.exercicios.push({
                    ...ex,
                    series: seriesReps.series,
                    repeticoes: seriesReps.repeticoes,
                    descanso: seriesReps.descanso
                });
            });
        });

        return workout;
    },

    /**
     * Seleciona exercícios variados (inclui casa se tempo for longo e local for academia)
     */
    selectVariedExercises(exercises, count, local) {
        if (exercises.length === 0) return [];

        // Embaralha exercícios
        const shuffled = [...exercises].sort(() => Math.random() - 0.5);
        
        let selected = [];
        
        // Se for academia com tempo longo, pode adicionar exercícios de casa como finalizadores
        if (local === 'academia' && count >= 3) {
            const academiaEx = shuffled.filter(ex => ex.location === 'academia');
            const casaEx = shuffled.filter(ex => ex.location === 'casa');
            
            // Pega 2/3 de academia e 1/3 de casa
            const numAcademia = Math.ceil(count * 0.7);
            const numCasa = count - numAcademia;
            
            selected = [
                ...academiaEx.slice(0, numAcademia),
                ...casaEx.slice(0, numCasa)
            ];
        } else {
            selected = shuffled.slice(0, count);
        }

        return selected;
    },

    /**
     * Define séries e repetições baseado no nível
     */
    getSeriesReps(nivel, grupoMuscular) {
        const configs = {
            'iniciante': {
                series: 3,
                repeticoes: '12-15',
                descanso: '60-90s'
            },
            'intermediario': {
                series: 4,
                repeticoes: '10-12',
                descanso: '60-75s'
            },
            'avancado': {
                series: 4,
                repeticoes: '8-12',
                descanso: '45-60s'
            }
        };

        // Ajustes para grupos específicos
        const config = { ...configs[nivel] || configs['intermediario'] };
        
        if (grupoMuscular === 'Abdômen') {
            config.repeticoes = '15-20';
            config.descanso = '30-45s';
        } else if (grupoMuscular === 'Panturrilha') {
            config.repeticoes = '15-20';
            config.descanso = '45-60s';
        }

        return config;
    },

    /**
     * Retorna notas e observações sobre o treino
     */
    getWorkoutNotes(objetivo, nivel, local) {
        const notes = [
            '💪 Sempre aqueça antes de começar o treino (5-10min de cardio leve)',
            '⏱️ Respeite os tempos de descanso entre as séries',
            '🎯 Foque na execução correta antes de aumentar a carga',
            '💧 Mantenha-se hidratado durante o treino'
        ];

        if (objetivo === 'hipertrofia') {
            notes.push('📈 Para ganho de massa: aumente a carga progressivamente a cada semana');
        } else if (objetivo === 'emagrecimento') {
            notes.push('🔥 Para emagrecer: reduza os descansos e mantenha intensidade alta');
        }

        if (nivel === 'iniciante') {
            notes.push('🌟 Iniciante: Priorize aprender a técnica nas primeiras semanas');
        }

        if (local === 'ambos' || local === 'academia') {
            notes.push('🏠 Exercícios de casa podem ser feitos como finalizadores ou em dias extras');
        }

        notes.push('📊 Cardio: Faça em dias separados ou após o treino (seção Cardio disponível na página)');

        return notes;
    },

    /**
     * Processa mensagem e retorna resposta aprimorada
     */
    async processMessage(message, originalReply) {
        const context = this.detectContext(message);
        let enhancedReply = originalReply;

        // Se pediu para gerar treino
        if (context.gerarTreino) {
            // Aqui você pode extrair preferências da mensagem ou usar valores padrão
            const userPreferences = this.extractUserPreferences(message);
            
            try {
                const workoutPlan = await this.generateWorkoutPlan(userPreferences);
                
                if (workoutPlan) {
                    let planHTML = `
                        <div class="workout-plan-generated">
                            <h3>🏋️ Seu Treino Personalizado</h3>
                            <p><strong>Divisão:</strong> ${workoutPlan.diasPorSemana}x por semana</p>
                            <p><strong>Sistema:</strong> ${workoutPlan.divisao.join(' / ')}</p>
                    `;

                    workoutPlan.treinos.forEach((treino, index) => {
                        planHTML += `
                            <div class="workout-day-plan">
                                <h4>${treino.nome}</h4>
                                <p class="muscle-groups">Grupos: ${treino.grupos.join(', ')}</p>
                                <ul class="exercise-list">
                        `;

                        treino.exercicios.forEach(ex => {
                            planHTML += `
                                <li>
                                    <strong>${ex.name}</strong> 
                                    - ${ex.series}x${ex.repeticoes} 
                                    (${ex.descanso} descanso)
                                    ${ex.location === 'casa' ? '🏠' : '🏋️'}
                                </li>
                            `;
                        });

                        planHTML += `
                                </ul>
                            </div>
                        `;
                    });

                    planHTML += `
                            <div class="workout-notes">
                                <h4>📋 Observações Importantes:</h4>
                                <ul>
                    `;

                    workoutPlan.observacoes.forEach(note => {
                        planHTML += `<li>${note}</li>`;
                    });

                    planHTML += `
                                </ul>
                            </div>
                            <button class="btn-save-workout" onclick="ChatAIHandler.saveWorkoutPlan()">
                                💾 Salvar este treino
                            </button>
                        </div>
                    `;

                    enhancedReply = planHTML;
                    
                    // Armazena o plano gerado temporariamente
                    this.lastGeneratedPlan = workoutPlan;
                }
            } catch (error) {
                console.error('Erro ao gerar treino:', error);
                enhancedReply = `
                    <p>❌ Desculpe, ocorreu um erro ao gerar seu treino. Por favor, tente novamente.</p>
                    <p>💡 Dica: Informe quantos dias você pode treinar, se é academia ou casa, e seu nível (iniciante/intermediário/avançado)</p>
                `;
            }
        }
        // Se pediu ajuda com exercício específico E quer vídeo
        else if (context.exercicio && context.videoHelp) {
            const videoUrl = this.getYouTubeVideoUrl(context.exercicio);
            const exerciseInfo = this.exerciseKnowledge[context.exercicio];

            let passosHTML = '<ol class="exercise-steps">';
            exerciseInfo.passos.forEach(passo => {
                passosHTML += `<li>${passo}</li>`;
            });
            passosHTML += '</ol>';

            enhancedReply = `
                <div class="chat-exercise-help">
                    <h4>🎯 ${context.exercicio.charAt(0).toUpperCase() + context.exercicio.slice(1)}</h4>
                    <p><strong>💪 Músculos trabalhados:</strong> ${exerciseInfo.musculos}</p>
                    <p><strong>📋 Como fazer (passo a passo):</strong></p>
                    ${passosHTML}
                    <p class="exercise-warning">⚠️ <strong>Erro comum:</strong> ${exerciseInfo.erroComum}</p>
                    <a href="${videoUrl}" target="_blank" class="video-link">
                        📹 Assistir vídeo tutorial no YouTube
                    </a>
                </div>
                ${originalReply}
            `;
        }
        // Se mencionou exercício mas não pediu vídeo explicitamente
        else if (context.exercicio && context.treino) {
            const exerciseInfo = this.exerciseKnowledge[context.exercicio];
            const videoUrl = this.getYouTubeVideoUrl(context.exercicio);

            let passosCompactos = '<ol class="exercise-steps-compact">';
            exerciseInfo.passos.slice(0, 3).forEach(passo => {
                passosCompactos += `<li>${passo}</li>`;
            });
            if (exerciseInfo.passos.length > 3) {
                passosCompactos += `<li><em>+ mais ${exerciseInfo.passos.length - 3} passos...</em></li>`;
            }
            passosCompactos += '</ol>';

            enhancedReply = originalReply + `
                <div class="chat-exercise-info">
                    <p><strong>💪 Músculos:</strong> ${exerciseInfo.musculos}</p>
                    <p><strong>📋 Resumo da execução:</strong></p>
                    ${passosCompactos}
                    <a href="${videoUrl}" target="_blank" class="video-link-small">
                        📹 Ver tutorial completo
                    </a>
                </div>
            `;
        }
        // Se pediu ajuda com treino mas não especificou exercício
        else if (context.treino && context.videoHelp) {
            enhancedReply = originalReply + `
                <p>💡 <em>Dica: Me diga qual exercício você quer ver (ex: "como fazer supino" ou "me ensina agachamento") e eu te envio um vídeo tutorial!</em></p>
            `;
        }
        // Se perguntou sobre alimentação
        else if (context.alimentacao) {
            // Detecta tópicos específicos de nutrição
            let nutritionTopic = null;
            for (const [topic, info] of Object.entries(this.nutritionKnowledge)) {
                if (message.toLowerCase().includes(topic)) {
                    nutritionTopic = { name: topic, ...info };
                    break;
                }
            }

            if (nutritionTopic) {
                let infoBox = `
                    <div class="chat-nutrition-info">
                        <h4>🥗 ${nutritionTopic.name.charAt(0).toUpperCase() + nutritionTopic.name.slice(1)}</h4>
                        <p>${nutritionTopic.info}</p>
                `;
                
                if (nutritionTopic.quantidade) {
                    infoBox += `<p><strong>Quantidade:</strong> ${nutritionTopic.quantidade}</p>`;
                }
                if (nutritionTopic.timing) {
                    infoBox += `<p><strong>Timing:</strong> ${nutritionTopic.timing}</p>`;
                }
                if (nutritionTopic.dica) {
                    infoBox += `<p><strong>⚠️ Atenção:</strong> ${nutritionTopic.dica}</p>`;
                }
                
                infoBox += `</div>`;
                
                enhancedReply = originalReply + infoBox;
            }
        }

        return enhancedReply;
    },

    /**
     * Extrai preferências do usuário da mensagem
     */
    extractUserPreferences(message) {
        const msgLower = message.toLowerCase();
        const preferences = {
            diasDisponiveis: 3,
            local: 'academia',
            objetivo: 'hipertrofia',
            nivel: 'intermediario',
            restricoes: [],
            tempoDisponivel: 'medio'
        };

        // Detecta dias disponíveis
        const diasMatch = msgLower.match(/(\d+)\s*(dias?|x|vezes)/i);
        if (diasMatch) {
            preferences.diasDisponiveis = parseInt(diasMatch[1]);
        }

        // Detecta local
        if (msgLower.includes('casa') && !msgLower.includes('academia')) {
            preferences.local = 'casa';
        } else if (msgLower.includes('academia') && !msgLower.includes('casa')) {
            preferences.local = 'academia';
        } else if (msgLower.includes('casa') && msgLower.includes('academia')) {
            preferences.local = 'ambos';
        }

        // Detecta nível
        if (msgLower.includes('iniciante') || msgLower.includes('começ')) {
            preferences.nivel = 'iniciante';
        } else if (msgLower.includes('avançado') || msgLower.includes('avanc')) {
            preferences.nivel = 'avancado';
        }

        // Detecta objetivo
        if (msgLower.includes('emagrec') || msgLower.includes('perd') || msgLower.includes('defin')) {
            preferences.objetivo = 'emagrecimento';
        } else if (msgLower.includes('gan') || msgLower.includes('mass') || msgLower.includes('hipertrofi')) {
            preferences.objetivo = 'hipertrofia';
        }

        // Detecta tempo disponível
        if (msgLower.includes('pouco tempo') || msgLower.includes('30 min') || msgLower.includes('rápid')) {
            preferences.tempoDisponivel = 'curto';
        } else if (msgLower.includes('muito tempo') || msgLower.includes('90 min') || msgLower.includes('2 hora')) {
            preferences.tempoDisponivel = 'longo';
        }

        // Detecta restrições
        const restricoes = ['joelho', 'ombro', 'costas', 'lombar', 'pulso', 'cotovelo'];
        restricoes.forEach(restricao => {
            if (msgLower.includes(restricao)) {
                preferences.restricoes.push(restricao);
            }
        });

        return preferences;
    },

    /**
     * Salva o plano de treino gerado
     */
    saveWorkoutPlan() {
        if (!this.lastGeneratedPlan) {
            showToast('Nenhum Treino ⚠️', 'Não há treino disponível para salvar.', 'warning');
            return;
        }

        try {
            // Salva no localStorage em ambos os formatos para compatibilidade
            localStorage.setItem('customWorkoutPlan', JSON.stringify(this.lastGeneratedPlan));
            
            // Converte para formato compatível com TreinoManager
            const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
            const treinoData = [];
            
            this.lastGeneratedPlan.treinos.forEach((treino, index) => {
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
            
            localStorage.setItem('treino', JSON.stringify(treinoData));
            
            showToast('Treino Salvo! ✅', 'Você pode acessá-lo na página de Treinos.', 'success');
            
            // Opcional: redirecionar para página de treinos
            // window.location.href = 'treino.html';
        } catch (error) {
            console.error('Erro ao salvar treino:', error);
            showToast('Erro ao Salvar ❌', 'Não foi possível salvar o treino. Tente novamente.', 'error');
        }
    }
};

// Exporta para uso global
if (typeof window !== 'undefined') {
    window.ChatAIHandler = ChatAIHandler;
}
