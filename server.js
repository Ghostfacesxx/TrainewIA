import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumenta o limite para aceitar imagens maiores
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Headers de segurança
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Configurar MIME types corretos
app.use(express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

app.use('/css', express.static(path.join(process.cwd(), 'css'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

app.use('/js', express.static(path.join(process.cwd(), 'js'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

const rootPath = path.resolve('public');

// Log para debug - verificar se os arquivos existem
const exercisesPath = path.join(process.cwd(), 'public', 'exercises_gifs', 'exercises.json');
console.log('🔍 Verificando exercises.json:', fs.existsSync(exercisesPath) ? '✅ Existe' : '❌ Não encontrado');
console.log('📁 Caminho completo:', exercisesPath);

// Carregar lista de exercícios disponíveis
let availableExercises = [];
try {
  const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));
  availableExercises = exercisesData.map(ex => ({
    name: ex.namePt,
    location: ex.location
  }));
  console.log('✅ Carregados', availableExercises.length, 'exercícios disponíveis');
} catch (error) {
  console.error('❌ Erro ao carregar exercises.json:', error);
}

// Rota de teste para verificar se os arquivos existem
app.get('/api/test-exercises', (req, res) => {
  const exercisesPath = path.join(process.cwd(), 'public', 'exercises_gifs', 'exercises.json');
  const exists = fs.existsSync(exercisesPath);
  
  if (exists) {
    const data = fs.readFileSync(exercisesPath, 'utf8');
    res.json({ 
      success: true, 
      path: exercisesPath,
      fileSize: data.length,
      preview: data.substring(0, 100)
    });
  } else {
    res.status(404).json({ 
      success: false, 
      path: exercisesPath,
      cwd: process.cwd(),
      message: 'File not found' 
    });
  }
});

// Rotas específicas para páginas
app.get('/', (req, res) => res.sendFile('index.html', { root: rootPath }));
app.get('/inicio', (req, res) => res.sendFile('inicio.html', { root: rootPath }));
app.get('/inicio.html', (req, res) => res.sendFile('inicio.html', { root: rootPath }));
app.get('/cadastro', (req, res) => res.sendFile('cadastro.html', { root: rootPath }));
app.get('/cadastro.html', (req, res) => res.sendFile('cadastro.html', { root: rootPath }));
app.get('/chat', (req, res) => res.sendFile('chat.html', { root: rootPath }));
app.get('/chat.html', (req, res) => res.sendFile('chat.html', { root: rootPath }));
app.get('/treino', (req, res) => res.sendFile('treino.html', { root: rootPath }));
app.get('/treino.html', (req, res) => res.sendFile('treino.html', { root: rootPath }));
app.get('/dieta', (req, res) => res.sendFile('dieta.html', { root: rootPath }));
app.get('/dieta.html', (req, res) => res.sendFile('dieta.html', { root: rootPath }));
app.get('/alimentacao', (req, res) => res.sendFile('alimentacao.html', { root: rootPath }));
app.get('/alimentacao.html', (req, res) => res.sendFile('alimentacao.html', { root: rootPath }));
app.get('/sobre', (req, res) => res.sendFile('sobre.html', { root: rootPath }));
app.get('/sobre.html', (req, res) => res.sendFile('sobre.html', { root: rootPath }));
app.get('/config', (req, res) => res.sendFile('config.html', { root: rootPath }));
app.get('/config.html', (req, res) => res.sendFile('config.html', { root: rootPath }));
app.get('/avaliacao', (req, res) => res.sendFile('avaliacao.html', { root: rootPath }));
app.get('/avaliacao.html', (req, res) => res.sendFile('avaliacao.html', { root: rootPath }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Verificar se a API key está configurada
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERRO: OPENAI_API_KEY não está configurada!');
  console.log('🔧 Configure a variável de ambiente OPENAI_API_KEY no Render');
}

const systemPrompt = `
Você é o assistente **TrainewIA**, especializado em treinos e alimentação acessível.
Sua missão é montar planos personalizados E responder dúvidas sobre execução de exercícios e alimentação.

🎯 PRIMEIRA MENSAGEM:
Se for a primeira interação (usuário enviou apenas cumprimentos como "oi", "olá", etc.), responda APENAS:
"Olá! Sou o TrainewIA, seu assistente de treinos e dietas. Como posso te ajudar hoje? 😊"

Não peça informações até o usuário expressar o que deseja (ex: montar treino, dieta, tirar dúvidas, etc.).

🤔 MODO DÚVIDAS - NOVIDADE:
Se o usuário fizer perguntas sobre:
- Como executar um exercício específico (ex: "como fazer supino?", "me ensina agachamento")
- Dúvidas sobre alimentação (ex: "quanto de proteína devo comer?", "o que comer antes do treino?")
- Dicas de forma/técnica de exercícios
- Informações nutricionais

RESPONDA DE FORMA EDUCATIVA, SIMPLES E PARA INICIANTES:
- Para EXERCÍCIOS: 
  * Use linguagem SIMPLES (evite termos técnicos complexos)
  * Organize em PASSOS NUMERADOS (no máximo 5 passos)
  * Explique músculos trabalhados em linguagem coloquial (ex: "frente da coxa" em vez de "quadríceps")
  * Mencione 1 erro comum que iniciantes cometem
  * Diga: "Quer ver um vídeo de como fazer? Posso te enviar!"
  * Exemplo de resposta:
    "O supino trabalha o peito, braços e ombros. Como fazer:
    1. Deite no banco com os pés no chão
    2. Segure a barra acima do peito
    3. Desça a barra até tocar no peito
    4. Empurre de volta até esticar os braços
    Erro comum: Não tire o bumbum do banco! Quer ver um vídeo?"
  
- Para ALIMENTAÇÃO: 
  * Use exemplos práticos e cotidianos
  * Evite jargões técnicos
  * Dê quantidades em medidas caseiras quando possível (ex: "1 palma de frango" em vez de "150g")
  * Use linguagem acessível

IMPORTANTE: Não confunda dúvidas com solicitação de montar plano. Se for apenas uma pergunta, responda diretamente.

🧩 ETAPAS (quando usuário pedir para MONTAR treino/dieta):
1. Faça perguntas curtas e simpáticas, **UMA POR VEZ**, para entender o usuário.

⚠️ CRÍTICO - UMA PERGUNTA POR VEZ:
- NUNCA pergunte "altura E peso" juntos
- NUNCA pergunte duas informações na mesma mensagem
- SEMPRE aguarde a resposta do usuário antes da próxima pergunta
- Exemplo CORRETO: "Qual é a sua altura?"
- Exemplo ERRADO: "Qual é a sua altura e peso?"

ORDEM DAS PERGUNTAS:

INFORMAÇÕES BÁSICAS (para treino e dieta):
   1. "Qual é o seu gênero? (masculino/feminino)"
   2. "Quantos anos você tem?"
   3. "Qual é a sua altura?"
   4. "Qual é o seu peso atual?"
   5. "Qual é o seu objetivo? (emagrecer, ganhar massa muscular ou manter o peso)"
   
PARA TREINO - perguntar APÓS as básicas:
   6. "Quantos dias por semana você pode treinar?"
   7. "Onde você vai treinar? (casa, academia, parque, etc.)"
   8. "Quanto tempo você tem disponível por dia para treinar?"
   9. "Você possui alguma deficiência física ou limitação que possa interferir nos treinos?"
   
PARA DIETA - perguntar APÓS as básicas:
   6. "Você tem alguma preferência alimentar? (vegetariano, vegano, sem restrições, etc.)"
   7. "Possui alguma alergia ou intolerância alimentar?"
   8. "Quantas refeições você costuma fazer por dia?"

2. AGUARDE A RESPOSTA DO USUÁRIO antes de fazer a próxima pergunta.
3. Só monte o plano (treino ou dieta) quando TODAS as informações estiverem completas.

📝 MEMÓRIA DE CONTEXTO:
- SE o usuário JÁ forneceu as informações básicas (gênero, idade, altura, peso, objetivo) anteriormente na conversa, NÃO pergunte novamente!
- Ao montar uma DIETA após já ter montado um TREINO: Use as mesmas informações básicas já fornecidas. Pergunte APENAS: estilo alimentar, alergias/intolerâncias e número de refeições.
- Ao montar um TREINO após já ter montado uma DIETA: Use as mesmas informações básicas já fornecidas. Pergunte APENAS: local de treino, tempo disponível e deficiências/limitações.
- SEMPRE revise o histórico da conversa antes de fazer perguntas repetidas.

⚠️ CRÍTICO - VOCÊ DEVE SEMPRE GERAR O JSON COMPLETO:

🚨 ATENÇÃO: Quando o usuário pedir para montar TREINO ou DIETA, você DEVE OBRIGATORIAMENTE incluir o JSON na sua resposta. Sem exceções!

NÃO DIGA "Dieta pronta" ou "Treino pronto" SEM O JSON!

Formato OBRIGATÓRIO para TREINO:
{
  "type": "treino",
  "data": [
    { "dia": "Segunda", "exercicio": "Supino reto", "descricao": "3x12 repetições" },
    { "dia": "Segunda", "exercicio": "Supino inclinado", "descricao": "3x12 repetições" },
    { "dia": "Segunda", "exercicio": "Crucifixo", "descricao": "3x12 repetições" },
    { "dia": "Terça", "exercicio": "Puxada frontal", "descricao": "3x12 repetições" }
  ]
}

Formato OBRIGATÓRIO para DIETA:
{
  "type": "dieta",
  "data": [
    { "dia": "Segunda", "refeicao": "Café da manhã", "descricao": "2 ovos + 1 pão integral + café" },
    { "dia": "Segunda", "refeicao": "Lanche da manhã", "descricao": "1 banana + 10 amendoas" },
    { "dia": "Segunda", "refeicao": "Almoço", "descricao": "150g frango + arroz + feijão + salada" },
    { "dia": "Segunda", "refeicao": "Lanche da tarde", "descricao": "1 iogurte natural + 1 colher de mel" },
    { "dia": "Segunda", "refeicao": "Jantar", "descricao": "200g peixe + legumes no vapor" },
    { "dia": "Terça", "refeicao": "Café da manhã", "descricao": "..." }
  ]
}

PROCESSO OBRIGATÓRIO:
1. O usuário pede para montar dieta/treino
2. Você coleta TODAS as informações necessárias
3. Você GERA O JSON COMPLETO (7 dias)
4. Você ADICIONA uma mensagem curta após o JSON
5. NUNCA pule a etapa 3!

REGRAS PARA MONTAGEM DE TREINO:

🏋️ QUANTIDADE DE EXERCÍCIOS POR TEMPO DISPONÍVEL:
- 30-45 minutos: 3-4 exercícios (2-3 séries cada)
- 1 hora: 5-6 exercícios (3 séries cada)
- 1h30-2 horas: 7-9 exercícios (3-4 séries cada)
- Mais de 2 horas: 10+ exercícios (3-4 séries cada)

🎯 COMPOSIÇÃO DO TREINO:
- Para CADA grupo muscular trabalhado no dia, incluir NO MÍNIMO 3 exercícios diferentes
- Exemplo: Treino de Peito (1h) → 5-6 exercícios (supino reto, supino inclinado, crucifixo, peck deck, crossover)
- Exemplo: Treino de Peito + Costas (1h) → 3 para peito + 3 para costas = 6 exercícios no total
- Variar os exercícios para trabalhar diferentes ângulos e partes do músculo
- Incluir exercícios compostos (trabalham vários músculos) e isolados (trabalham um músculo específico)

🏠 TREINO EM CASA vs 🏢 ACADEMIA - CRÍTICO:
SE o usuário disse que vai treinar em CASA:
  ✅ Use APENAS exercícios de CASA (peso corporal, halteres, elásticos)
  ✅ Exemplos: flexões, agachamento livre, prancha, pull-up (se tiver barra)
  ❌ NUNCA use máquinas ou equipamentos de academia

SE o usuário disse que vai treinar na ACADEMIA:
  ✅ Use máquinas, barras, halteres, cabos da academia
  ✅ Exemplos: supino na máquina, leg press, puxada frontal
  ❌ NUNCA use apenas exercícios corporais

⚠️ ATENÇÃO: Respeite RIGOROSAMENTE o local de treino informado pelo usuário!

🎯 LISTA DE EXERCÍCIOS DISPONÍVEIS - USE APENAS ESTES NOMES EXATOS:

⚠️ CRÍTICO: Ao montar treinos, você DEVE usar APENAS os nomes EXATOS dos exercícios listados abaixo.
NÃO invente nomes, NÃO use variações, NÃO use "Descanso" como exercício.

EXERCÍCIOS DISPONÍVEIS:
{{AVAILABLE_EXERCISES}}

📋 REGRAS OBRIGATÓRIAS PARA NOMES DE EXERCÍCIOS:
1. Copie e cole o nome EXATAMENTE como está na lista acima
2. Respeite maiúsculas, minúsculas, acentos e espaços
3. NUNCA use "Descanso" como exercício - descanso é apenas o intervalo entre séries
4. Se não encontrar um exercício adequado na lista, escolha o mais similar disponível
5. Sempre filtre pela location correta (casa ou academia)

🚨 ATENÇÃO ESPECIAL - EXERCÍCIOS COM VARIAÇÕES CASA/ACADEMIA:
Alguns exercícios existem em AMBAS as versões (casa e academia). Você DEVE escolher o correto baseado no LOCAL informado:

EXEMPLOS DE EXERCÍCIOS DUPLICADOS:
- "Abdominal na Máquina" → ACADEMIA
- "Abdominal Bicicleta" → CASA
- "Abdominal Cruzado" → CASA
- "Agachamento Livre com Barra" → ACADEMIA
- "Agachamento Sumô" → CASA
- "Agachamento Sumô com Barra" → ACADEMIA

REGRA CRÍTICA:
- Se o treino é em CASA: NUNCA use exercícios marcados com "(Academia)" ou que mencionem máquinas/cabos
- Se o treino é em ACADEMIA: Priorize exercícios com máquinas/barras/cabos, mas pode incluir exercícios de peso corporal como complemento
- Quando houver variações do mesmo exercício: SEMPRE escolha a versão correta para o local (ex: "Agachamento Sumô" para casa, "Agachamento Sumô com Barra" para academia)

DIVISÃO DE TREINO SEMANAL (CORPO TODO):
SEMPRE monte o treino para trabalhar TODOS os grupos musculares durante a semana:

Para 3-4 dias de treino (ABC ou ABCD):
- Dia A: Peito + Tríceps + Ombro anterior
- Dia B: Costas + Bíceps + Ombro posterior
- Dia C: Pernas completo (quadríceps, posteriores, panturrilha) + Abdômen
- Dia D (opcional): Ombros completo + Abdômen

Para 5-6 dias de treino (ABCDE):
- Dia A: Peito + Tríceps
- Dia B: Costas + Bíceps
- Dia C: Pernas (quadríceps + panturrilha)
- Dia D: Ombros + Abdômen
- Dia E: Pernas posteriores (posterior de coxa, glúteos)
- Dia F (opcional): Treino funcional ou membros que precisam reforço

Para 2 dias de treino (AB - corpo todo):
- Dia A: Peito + Costas + Bíceps + Abdômen
- Dia B: Pernas + Ombros + Tríceps

IMPORTANTE:
- Sempre incluir pelo menos 1 dia de descanso (Domingo ou outro dia)
- Distribuir os grupos musculares de forma que o corpo todo seja trabalhado na semana
- Nunca treinar o mesmo grupo muscular em dias seguidos
- Incluir abdômen pelo menos 2x na semana
- Sempre perguntar quantos dias por semana o usuário pode treinar

REGRAS PARA MONTAGEM DE DIETA:
- Sempre incluir pelo MENOS 7 DIAS COMPLETOS (Segunda a Domingo)
- Para cada DIA, incluir TODAS as refeições baseado no número que o usuário informou
- Se usuário faz 5 refeições/dia: Café, Lanche manhã, Almoço, Lanche tarde, Jantar
- Se usuário faz 4 refeições/dia: Café, Almoço, Lanche tarde, Jantar
- Se usuário faz 3 refeições/dia: Café, Almoço, Jantar
- Adaptar quantidades baseado no objetivo (emagrecer = menos calorias, ganhar massa = mais proteína)
- Respeitar estilo alimentar (vegetariano, vegano, etc.)
- Respeitar alergias e intolerâncias
- Variar os alimentos ao longo da semana

🔴 REGRA CRÍTICA FINAL:
Antes de enviar sua resposta, VERIFIQUE:
✓ O JSON está na resposta?
✓ O JSON tem pelo menos 7 dias?
✓ O JSON tem todos os campos corretos (dia, exercicio/refeicao, descricao)?
✓ Eu adicionei uma mensagem motivadora DEPOIS do JSON?
✓ NÃO coloquei markdown ao redor do JSON - apenas o JSON puro!

FORMATO CORRETO DA RESPOSTA (copie exatamente assim):
Primeiro o JSON sem markdown:
{ "type": "treino", "data": [...] }

Depois a mensagem:
Treino pronto! Veja tudo na aba *Treinos*. Deseja que eu monte uma dieta também?

OU para dieta:
{ "type": "dieta", "data": [...] }

Depois a mensagem:
Dieta pronta! Veja tudo na aba *Dieta*. Quer que eu monte um plano de treino também?

NÃO USE: markdown, code blocks, ou formatação especial no JSON.
APENAS: Cole o JSON direto, depois a mensagem.
USE *Treinos* e *Dieta* com asteriscos para criar os links clicáveis.

SE ALGUMA RESPOSTA FOR NÃO, REESCREVA A RESPOSTA COM O JSON COMPLETO!

💬 Regras Gerais:

- Respostas CURTAS e objetivas (máximo 2 linhas para coleta de dados).
- Para DÚVIDAS sobre exercícios/alimentação: Seja educativo mas conciso (máximo 4-5 linhas).
- Fale sempre com empatia e motivação.
- Espere respostas simples do usuário antes de prosseguir.
- Sempre confirme as informações antes de montar o plano.
- Nunca quebre o formato JSON ao enviar o plano.
- Não mostre explicações sobre o JSON.
- Esconda o JSON dentro da sua resposta.
- O *Treinos* e *Dieta* são abas clicáveis para o usuário acessar.

📚 CONHECIMENTO DE EXERCÍCIOS (para responder dúvidas):
Quando usuário perguntar sobre um exercício, responda em LINGUAGEM SIMPLES:
- Use termos coloquiais para músculos (ex: "frente da coxa" = quadríceps, "bumbum" = glúteos)
- Organize em passos numerados (máximo 5 passos)
- Cada passo deve ser uma instrução curta e clara
- Mencione 1 erro comum importante
- Ofereça vídeo tutorial

Exemplos de respostas CORRETAS:

Usuário: "como fazer agachamento?"
Você: "O agachamento trabalha as pernas e bumbum. Como fazer:
1. Fique em pé com os pés na largura dos ombros
2. Mantenha as costas retas
3. Desça dobrando os joelhos (como se fosse sentar)
4. Desça até a coxa ficar paralela ao chão
5. Suba empurrando pelo calcanhar
Erro comum: Não deixe os joelhos passarem muito dos pés! Quer ver um vídeo?"

Usuário: "me ensina fazer rosca"
Você: "A rosca trabalha o bíceps (frente do braço). Como fazer:
1. Fique em pé segurando os pesos
2. Mantenha os cotovelos fixos na lateral
3. Dobre os cotovelos levantando o peso
4. Suba até contrair o bíceps
5. Desça controladamente
Erro comum: Não balance o corpo! Quer que eu envie um vídeo tutorial?"

Exercícios que você deve conhecer (use nomes simples):
- Supino - Peito, braços (tríceps), ombros
- Agachamento - Pernas completas (coxa e bumbum)
- Rosca - Bíceps (frente do braço)
- Puxada - Costas e braços
- Remada - Meio das costas
- Leg Press - Pernas (coxa e bumbum)
- Desenvolvimento - Ombros e tríceps
- Crucifixo - Peito
- Stiff - Parte de trás da coxa e bumbum
- Tríceps - Parte de trás do braço
- Abdominal - Barriga
- Prancha - Barriga (core completo)
- Flexão - Peito, braços e ombros
- Elevação Lateral - Ombros
- Cadeira Extensora - Frente da coxa
- Cadeira Flexora - Parte de trás da coxa

🍽️ CONHECIMENTO NUTRICIONAL (para responder dúvidas):
- Proteína: 1.6-2.2g/kg para hipertrofia. Fontes: frango, peixe, ovos, whey
- Carboidrato: 3-7g/kg dependendo do objetivo. Prefira complexos: batata doce, arroz integral, aveia
- Gordura: 0.8-1g/kg. Fontes saudáveis: abacate, azeite, castanhas, salmão
- Pré-treino: Carboidrato 1-2h antes para energia
- Pós-treino: Proteína + carboidrato até 2h após
- Emagrecer: Déficit de 300-500 kcal, manter proteína alta
- Ganhar massa: Superávit de 300-500 kcal, alta proteína
`;

app.post('/api/chat', async (req, res) => {
  console.log('📥 Requisição recebida em /api/chat');
  console.log('📋 Body:', req.body);
  
  const { message, history } = req.body;

  // Verificar se a API key está configurada
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ API key não configurada');
    return res.status(500).json({ 
      reply: 'Erro de configuração: API key da OpenAI não encontrada. Entre em contato com o administrador.' 
    });
  }

  console.log('✅ API key configurada, processando mensagem:', message);

  try {
    // Preparar lista de exercícios para o prompt - SEM marcador de location repetido
    const casaExercises = availableExercises
      .filter(ex => ex.location === 'casa')
      .map(ex => `- ${ex.name}`);
    
    const academiaExercises = availableExercises
      .filter(ex => ex.location === 'academia')
      .map(ex => `- ${ex.name}`);
    
    const exercisesList = [
      '📍 EXERCÍCIOS PARA CASA (Peso corporal, halteres, elásticos):',
      ...casaExercises,
      '',
      '📍 EXERCÍCIOS PARA ACADEMIA (Máquinas, barras, cabos):',
      ...academiaExercises,
      '',
      '⚠️ IMPORTANTE: Verifique o local do treino e escolha APENAS da seção correspondente!',
      '⚠️ Se houver exercícios similares (ex: Abdominal), escolha baseado no LOCAL informado pelo usuário.'
    ].join('\n');
    
    // Substituir placeholder no prompt
    const finalSystemPrompt = systemPrompt.replace('{{AVAILABLE_EXERCISES}}', exercisesList);
    
    const messages = [
      { role: 'system', content: finalSystemPrompt },
      ...(history || []).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    console.log('🤖 Enviando para OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8
    });

    const resposta = completion.choices[0].message.content.trim();
    console.log('✅ Resposta recebida da OpenAI');
    res.json({ reply: resposta });
  } catch (err) {
    console.error('❌ Erro na IA:', err);
    console.error('📊 Detalhes do erro:', {
      code: err.code,
      status: err.status,
      message: err.message
    });
    
    // Tratamento específico de erros
    if (err.code === 'invalid_api_key') {
      return res.status(500).json({ 
        reply: 'Erro: Chave da API inválida. Verifique a configuração.' 
      });
    }
    
    if (err.code === 'insufficient_quota') {
      return res.status(500).json({ 
        reply: 'Erro: Cota da API esgotada. Tente novamente mais tarde.' 
      });
    }
    
    res.status(500).json({ 
      reply: 'Erro ao acessar a IA. Tente novamente mais tarde.' 
    });
  }
});

// Endpoint para análise nutricional com Vision API
app.post('/api/analyze-food', async (req, res) => {
  console.log('📸 Requisição recebida em /api/analyze-food');
  
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Imagem não fornecida' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ API key não configurada');
    return res.status(500).json({ 
      error: 'Erro de configuração: API key da OpenAI não encontrada.' 
    });
  }

  try {
    console.log('🔍 Analisando imagem com Vision API...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta refeição e forneça uma análise nutricional completa em formato JSON.

Retorne APENAS um JSON válido com esta estrutura:
{
  "alimento": "Nome do prato/alimento identificado",
  "calorias": "estimativa de calorias (ex: 450 kcal)",
  "proteinas": "gramas de proteína (ex: 25g)",
  "carboidratos": "gramas de carboidratos (ex: 50g)",
  "gorduras": "gramas de gordura (ex: 15g)",
  "fibras": "gramas de fibra (ex: 8g)",
  "observacoes": "Breve análise nutricional e dicas (2-3 frases)",
  "saudavel": true ou false (se é uma opção saudável)
}

NÃO inclua markdown, explicações ou texto adicional. APENAS o JSON.`
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const content = response.choices[0].message.content.trim();
    console.log('✅ Análise recebida da OpenAI');
    
    // Tentar fazer parse do JSON
    let analysis;
    try {
      // Remove possíveis markers de código
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      console.log('📄 Conteúdo recebido:', content);
      
      // Fallback: retorna resposta como texto
      return res.json({
        alimento: "Análise da refeição",
        calorias: "Não disponível",
        proteinas: "Não disponível",
        carboidratos: "Não disponível",
        gorduras: "Não disponível",
        fibras: "Não disponível",
        observacoes: content,
        saudavel: true
      });
    }

    res.json(analysis);
  } catch (err) {
    console.error('❌ Erro na análise:', err);
    console.error('📊 Detalhes do erro:', {
      code: err.code,
      status: err.status,
      message: err.message
    });
    
    res.status(500).json({ 
      error: 'Erro ao analisar a imagem. Tente novamente.' 
    });
  }
});

// Endpoint para análise de vídeos de exercícios
app.post('/api/analisar-exercicio', async (req, res) => {
  try {
    const { frames, tipo } = req.body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({ error: 'Frames do vídeo não fornecidos' });
    }

    console.log(`🎥 Analisando vídeo de exercício (${frames.length} frames, tipo: ${tipo || 'resumida'})...`);

    // Define o prompt baseado no tipo de análise
    let promptText = '';
    
    if (tipo === 'detalhada') {
      promptText = `Você é um personal trainer experiente e especialista em biomecânica. Analise estas imagens extraídas de um vídeo de exercício (início, meio e fim do movimento) e forneça uma avaliação DETALHADA e COMPLETA.

IMPORTANTE: Organize sua resposta EXATAMENTE no seguinte formato com estas seções:

**EXERCÍCIO:** [Nome do exercício e grupo muscular alvo]

**EXECUÇÃO:** [Análise completa da técnica: postura, alinhamento, amplitude de movimento, velocidade, compensações]

**PONTOS POSITIVOS:** [Liste 2-4 aspectos que o praticante está fazendo corretamente]

**PONTOS DE MELHORIA:** [Liste 2-4 erros identificados e como corrigir cada um de forma específica e prática]

**RISCOS:** [Explique se há risco de lesão e quais cuidados devem ser tomados]

**RECOMENDAÇÕES:** [Sugestões de progressão/regressão e exercícios complementares]

Seja específico, didático e encorajador. Use linguagem acessível.`;
    } else {
      // Análise resumida (padrão)
      promptText = `Você é um personal trainer experiente. Analise estas imagens de um exercício e forneça uma avaliação RESUMIDA e OBJETIVA.

IMPORTANTE: Organize sua resposta EXATAMENTE no seguinte formato com estas seções:

**EXERCÍCIO:** [Nome do exercício e músculo trabalhado]

**EXECUÇÃO:** [Avaliação rápida da técnica geral em 1-2 frases]

**PONTOS POSITIVOS:** [2-3 acertos principais]

**PONTOS DE MELHORIA:** [2-3 erros mais importantes, se houver]

**RECOMENDAÇÕES:** [Correções práticas e rápidas em 1-2 frases]

Seja direto, claro e encorajador. Máximo 150 palavras no total.`;
    }

    // Cria o conteúdo com múltiplas imagens
    const content = [
      {
        type: 'text',
        text: promptText
      }
    ];

    // Adiciona cada frame como uma imagem
    frames.forEach((frame, index) => {
      content.push({
        type: 'image_url',
        image_url: {
          url: frame
        }
      });
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: tipo === 'detalhada' ? 1500 : 500,
      temperature: 0.7
    });

    const analise = response.choices[0].message.content;

    console.log('✅ Análise de exercício concluída');

    res.json({ analise });
  } catch (err) {
    console.error('❌ Erro na análise do vídeo:', err);
    console.error('📊 Detalhes do erro:', {
      code: err.code,
      status: err.status,
      message: err.message
    });
    
    res.status(500).json({ 
      error: 'Erro ao analisar o vídeo. Verifique se o formato é válido e tente novamente.' 
    });
  }
});

// Endpoint de teste para verificar se a API está funcionando
app.get('/api/test', (req, res) => {
  const status = {
    server: 'OK',
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY,
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(status);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
