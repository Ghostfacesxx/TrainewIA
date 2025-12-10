/**
 * Local Exercise Service
 * Serviço para gerenciar exercícios locais com GIFs
 */

const LocalExerciseService = {
    exercises: [],
    bodyParts: [],
    equipments: [],
    muscles: [],
    loaded: false,

    /**
     * Carrega todos os dados dos arquivos JSON
     */
    async loadData() {
        if (this.loaded) return;

        try {
            // Carrega exercises
            const exercisesResponse = await fetch('exercises_gifs/exercises.json');
            this.exercises = await exercisesResponse.json();

            // Carrega bodyParts traduzidos
            const bodyPartsResponse = await fetch('exercises_gifs/bodyParts_pt.json');
            this.bodyParts = await bodyPartsResponse.json();

            // Carrega equipments traduzidos
            const equipmentsResponse = await fetch('exercises_gifs/equipments_pt.json');
            this.equipments = await equipmentsResponse.json();

            // Carrega muscles traduzidos
            const musclesResponse = await fetch('exercises_gifs/muscles_pt.json');
            this.muscles = await musclesResponse.json();

            this.loaded = true;
            console.log('✅ Dados de exercícios carregados:', {
                exercises: this.exercises.length,
                bodyParts: this.bodyParts.length,
                equipments: this.equipments.length,
                muscles: this.muscles.length
            });
        } catch (error) {
            console.error('❌ Erro ao carregar dados de exercícios:', error);
        }
    },

    /**
     * Traduz nome de músculo
     */
    translateMuscle(muscleName) {
        const muscle = this.muscles.find(m => m.name === muscleName);
        return muscle ? muscle.namePt : muscleName;
    },

    /**
     * Traduz nome de parte do corpo
     */
    translateBodyPart(bodyPartName) {
        const bodyPart = this.bodyParts.find(bp => bp.name === bodyPartName);
        return bodyPart ? bodyPart.namePt : bodyPartName;
    },

    /**
     * Traduz nome de equipamento
     */
    translateEquipment(equipmentName) {
        const equipment = this.equipments.find(e => e.name === equipmentName);
        return equipment ? equipment.namePt : equipmentName;
    },

    /**
     * Traduz instruções do exercício
     */
    translateInstructions(instructions) {
        return instructions.map(instruction => {
            // Remove "Step:X " do início
            return instruction.replace(/^Step:\d+\s*/, '');
        });
    },

    /**
     * Busca exercício por nome (português ou inglês)
     */
    findExerciseByName(searchName) {
        if (!this.loaded) {
            console.warn('⚠️ Dados ainda não carregados');
            return null;
        }

        const normalizedSearch = this.normalizeName(searchName);
        
        return this.exercises.find(ex => {
            const normalizedExName = this.normalizeName(ex.name);
            const normalizedExNamePt = ex.namePt ? this.normalizeName(ex.namePt) : '';
            
            return normalizedExName.includes(normalizedSearch) || 
                   normalizedSearch.includes(normalizedExName) ||
                   normalizedExNamePt.includes(normalizedSearch) ||
                   normalizedSearch.includes(normalizedExNamePt);
        });
    },

    /**
     * Normaliza nome para comparação
     */
    normalizeName(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .trim();
    },

    /**
     * Obtém URL do GIF local
     */
    getGifUrl(exerciseId) {
        const exercise = this.exercises.find(ex => ex.id === exerciseId || ex.exerciseId === exerciseId);
        if (exercise && exercise.gifUrl) {
            // Retorna apenas o caminho relativo dentro de exercises_gifs
            return exercise.gifUrl;
        }
        return null;
    },

    /**
     * Obtém dados completos do exercício com traduções
     */
    getExerciseData(exerciseName) {
        const exercise = this.findExerciseByName(exerciseName);
        
        if (!exercise) {
            console.log(`⚠️ Exercício não encontrado: ${exerciseName}`);
            return null;
        }

        const exerciseId = exercise.id || exercise.exerciseId;

        return {
            id: exerciseId,
            name: exercise.namePt || exercise.name,
            nameEn: exercise.name,
            gifUrl: this.getGifUrl(exerciseId),
            targetMuscles: (exercise.targetMuscles || []).map(m => this.translateMuscle(m)),
            targetMusclesEn: exercise.targetMuscles || [],
            bodyParts: (exercise.bodyParts || []).map(bp => this.translateBodyPart(bp)),
            bodyPartsEn: exercise.bodyParts || [],
            equipments: (exercise.equipments || []).map(eq => this.translateEquipment(eq)),
            equipmentsEn: exercise.equipments || [],
            secondaryMuscles: (exercise.secondaryMuscles || []).map(m => this.translateMuscle(m)),
            secondaryMusclesEn: exercise.secondaryMuscles || [],
            instructions: this.translateInstructions(exercise.instructions || []),
            instructionsEn: exercise.instructions || []
        };
    },

    /**
     * Mapeamento PT-BR para facilitar busca
     */
    getPortugueseMapping() {
        return {
            // Peito
            'supino reto': 'barbell bench press',
            'supino': 'bench press',
            'supino inclinado': 'incline bench press',
            'supino declinado': 'decline bench press',
            'crucifixo': 'dumbbell fly',
            'peck deck': 'pec deck',
            'flexao': 'push up',
            'flexao de braco': 'push up',
            
            // Costas
            'puxada frontal': 'lat pulldown',
            'puxada': 'pulldown',
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
            'stiff': 'stiff',
            'panturrilha': 'calf raise',
            'elevacao de panturrilha': 'calf raise',
            'afundo': 'lunge',
            
            // Ombros
            'desenvolvimento': 'shoulder press',
            'desenvolvimento militar': 'military press',
            'elevacao lateral': 'lateral raise',
            'elevacao frontal': 'front raise',
            'remada alta': 'upright row',
            
            // Bíceps
            'rosca direta': 'bicep curl',
            'rosca alternada': 'alternating bicep curl',
            'rosca martelo': 'hammer curl',
            'rosca scott': 'preacher curl',
            'rosca': 'curl',
            
            // Tríceps
            'triceps testa': 'skull crusher',
            'triceps corda': 'tricep rope pushdown',
            'triceps pulley': 'tricep pushdown',
            'triceps': 'tricep',
            'mergulho': 'dip',
            'frances': 'overhead extension',
            
            // Abdômen
            'abdominal': 'crunch',
            'prancha': 'plank',
            'elevacao de pernas': 'leg raise',
            'abdominal infra': 'reverse crunch',
            
            // Cardio
            'corrida': 'running',
            'esteira': 'treadmill',
            'bicicleta': 'cycling',
            'bike': 'bike'
        };
    },

    /**
     * Busca exercício traduzindo do português
     */
    searchExercise(searchTerm) {
        const mapping = this.getPortugueseMapping();
        const normalized = this.normalizeName(searchTerm);
        
        // Tenta encontrar mapeamento direto
        for (const [pt, en] of Object.entries(mapping)) {
            if (normalized.includes(this.normalizeName(pt))) {
                const exercise = this.findExerciseByName(en);
                if (exercise) return this.getExerciseData(en);
            }
        }
        
        // Busca direta
        return this.getExerciseData(searchTerm);
    }
};

// Carrega os dados quando o script é incluído
if (typeof window !== 'undefined') {
    window.LocalExerciseService = LocalExerciseService;
    LocalExerciseService.loadData();
}
