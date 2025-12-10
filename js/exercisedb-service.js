/**
 * ExerciseDB Service
 * Serviço para integração com a API ExerciseDB via RapidAPI
 * Busca GIFs de exercícios baseado no nome
 */

const ExerciseDBService = {
    // Configuração da API
    API_KEY: 'beff993650msh1412cbb74a3d082p1f2d9acjsn60e90b58457c',
    API_HOST: 'exercisedb.p.rapidapi.com',
    BASE_URL: 'https://exercisedb.p.rapidapi.com',
    
    // Cache de exercícios para evitar múltiplas requisições
    exercisesCache: null,
    cacheTimestamp: null,
    CACHE_DURATION: 3600000, // 1 hora em milissegundos
    
    // Resolução padrão (360 para plano BASIC/PRO)
    defaultResolution: '360',
    
    /**
     * IDs de exercícios comuns (fallback direto para evitar busca)
     */
    commonExerciseIds: {
        // Peito
        'bench press': '0025',
        'incline bench press': '0046',
        'decline bench press': '0033',
        'dumbbell fly': '1277',
        'pec deck': '0662',
        'push up': '0662',
        'chest press': '0025',
        
        // Costas
        'pull up': '0688',
        'lat pulldown': '0585',
        'bent over row': '0027',
        'row': '0027',
        'deadlift': '0032',
        'cable row': '1347',
        
        // Pernas
        'squat': '0043',
        'leg press': '0036',
        'leg extension': '0035',
        'leg curl': '0033',
        'lunge': '0582',
        'calf raise': '1375',
        'stiff leg deadlift': '0032',
        
        // Ombros
        'shoulder press': '0044',
        'military press': '0044',
        'lateral raise': '0345',
        'front raise': '0318',
        'upright row': '0830',
        'rear delt fly': '1323',
        
        // Bíceps
        'bicep curl': '0023',
        'hammer curl': '1621',
        'preacher curl': '0405',
        'concentration curl': '1719',
        'alternating bicep curl': '1645',
        
        // Tríceps
        'tricep pushdown': '0826',
        'skull crusher': '0175',
        'tricep rope pushdown': '0826',
        'dip': '1430',
        'overhead tricep extension': '0192',
        'tricep extension': '0192',
        'tricep': '0826',
        
        // Abdômen
        'crunch': '0030',
        'plank': '0041',
        'leg raise': '1498',
        'reverse crunch': '0973',
        'sit up': '0564',
        'bicycle crunch': '0028',
        
        // Cardio
        'running': '0000',
        'treadmill': '0000',
        'cycling': '0001',
        'burpee': '0580'
    },
    
    /**
     * Busca todos os exercícios da API (com cache)
     */
    async getAllExercises() {
        // Sempre retorna cache vazio para evitar 429
        // Usaremos apenas IDs diretos
        return this.exercisesCache || [];
    },
    
    /**
     * Busca um exercício pelo nome (DESABILITADO - apenas IDs diretos)
     */
    async searchExerciseByName(name) {
        // Não busca na API para evitar 429
        // Retorna null para usar fallback
        return null;
    },
    
    /**
     * Normaliza um nome para comparação
     */
    normalizeName(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
            .trim();
    },
    
    /**
     * Mapeamento de exercícios em português para inglês
     */
    getPortugueseMapping() {
        return {
            // Peito
            'supino reto': 'bench press',
            'supino': 'bench press',
            'supino inclinado': 'incline bench press',
            'supino declinado': 'decline bench press',
            'crucifixo': 'dumbbell fly',
            'peck deck': 'pec deck',
            'flexao': 'push up',
            'flexao de braco': 'push up',
            
            // Costas
            'puxada frontal': 'lat pulldown',
            'puxada': 'lat pulldown',
            'remada curvada': 'bent over row',
            'remada': 'row',
            'barra fixa': 'pull up',
            'pulldown': 'lat pulldown',
            'levantamento terra': 'deadlift',
            'terra': 'deadlift',
            
            // Pernas
            'agachamento': 'squat',
            'leg press': 'leg press',
            'cadeira extensora': 'leg extension',
            'cadeira flexora': 'leg curl',
            'extensora': 'leg extension',
            'flexora': 'leg curl',
            'stiff': 'stiff leg deadlift',
            'panturrilha': 'calf raise',
            'elevacao de panturrilha': 'calf raise',
            'afundo': 'lunge',
            'gluteo': 'glute',
            
            // Ombros
            'desenvolvimento': 'shoulder press',
            'desenvolvimento militar': 'military press',
            'elevacao lateral': 'lateral raise',
            'elevacao frontal': 'front raise',
            'elevacao posterior': 'rear delt fly',
            'remada alta': 'upright row',
            
            // Bíceps
            'rosca direta': 'bicep curl',
            'rosca alternada': 'alternating bicep curl',
            'rosca martelo': 'hammer curl',
            'rosca scott': 'preacher curl',
            'rosca concentrada': 'concentration curl',
            'rosca': 'bicep curl',
            
            // Tríceps
            'triceps testa': 'skull crusher',
            'triceps corda': 'tricep rope pushdown',
            'triceps pulley': 'tricep pushdown',
            'triceps': 'tricep',
            'mergulho': 'dip',
            'frances': 'overhead tricep extension',
            
            // Abdômen
            'abdominal': 'crunch',
            'prancha': 'plank',
            'elevacao de pernas': 'leg raise',
            'abdominal infra': 'reverse crunch',
            'abdominal supra': 'crunch',
            
            // Cardio
            'corrida': 'running',
            'esteira': 'treadmill',
            'bicicleta': 'cycling',
            'bike': 'cycling'
        };
    },
    
    /**
     * Obtém a URL do GIF para um exercício
     */
    getGifUrl(exerciseId, resolution = null) {
        // Retorna URL direta do GIF do repositório público do ExerciseDB
        // Formato: ID de 4 dígitos com .gif
        const paddedId = String(exerciseId).padStart(4, '0');
        return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${paddedId}.gif`;
    },
    
    /**
     * Busca o GIF de um exercício pelo nome
     */
    async getExerciseGif(exerciseName) {
        try {
            // Normaliza o nome
            const normalizedName = this.normalizeName(exerciseName);
            
            // Tenta mapeamento direto PT->EN
            const mapping = this.getPortugueseMapping();
            const englishName = mapping[normalizedName];
            
            // Se encontrou mapeamento, tenta pegar ID direto
            if (englishName && this.commonExerciseIds[englishName]) {
                const exerciseId = this.commonExerciseIds[englishName];
                console.log(`✅ GIF direto: ${exerciseName} -> ${englishName} (ID: ${exerciseId})`);
                
                return {
                    id: exerciseId,
                    name: englishName,
                    gifUrl: this.getGifUrl(exerciseId),
                    bodyPart: 'unknown',
                    target: 'unknown',
                    equipment: 'unknown',
                    instructions: []
                };
            }
            
            // Se não encontrou, retorna null (não busca na API)
            console.log(`⚠️ GIF não encontrado: ${exerciseName} (sem mapeamento)`);
            return null;
            
        } catch (error) {
            console.error(`❌ Erro ao buscar GIF para ${exerciseName}:`, error);
            return null;
        }
    },
    
    /**
     * Busca múltiplos GIFs de uma vez
     */
    async getMultipleExerciseGifs(exerciseNames) {
        const gifMap = {};
        
        // Processa um por vez para evitar 429
        for (const name of exerciseNames) {
            const gifData = await this.getExerciseGif(name);
            gifMap[name] = gifData;
            
            // Pequeno delay entre requisições
            if (gifData && gifData.id && !this.commonExerciseIds[gifData.name]) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        return gifMap;
    },
    
    /**
     * Pré-carrega os exercícios em background
     */
    async preloadExercises() {
        // Não pré-carrega automaticamente para evitar 429
        // Os exercícios serão buscados sob demanda
        console.log('ℹ️ Exercícios serão carregados sob demanda');
        return [];
    },
    
    /**
     * Busca por parte do corpo
     */
    async getExercisesByBodyPart(bodyPart) {
        try {
            const response = await fetch(`${this.BASE_URL}/exercises/bodyPart/${bodyPart}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': this.API_KEY,
                    'X-RapidAPI-Host': this.API_HOST
                }
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar exercícios por bodyPart ${bodyPart}:`, error);
            return [];
        }
    },
    
    /**
     * Testa a conexão com a API
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.BASE_URL}/status?rapidapi-key=${this.API_KEY}`);
            const status = await response.text();
            console.log('✅ ExerciseDB API Status:', status);
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar com ExerciseDB:', error);
            return false;
        }
    }
};

// Pré-carrega os exercícios quando a página carregar
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Não pré-carrega para evitar 429
        // Os GIFs serão buscados sob demanda com cache
        console.log('✅ ExerciseDB Service carregado (modo sob demanda)');
    });
}
