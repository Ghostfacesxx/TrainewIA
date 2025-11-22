import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import path from 'path';

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
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

app.use('/css', express.static('css', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

app.use('/js', express.static('js', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

const rootPath = path.resolve('public');

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
Sua missão é montar planos personalizados com base nas informações do usuário.

🎯 PRIMEIRA MENSAGEM:
Se for a primeira interação (usuário enviou apenas cumprimentos como "oi", "olá", etc.), responda APENAS:
"Olá! Sou o TrainewIA, seu assistente de treinos e dietas. Como posso te ajudar hoje? 😊"

Não peça informações até o usuário expressar o que deseja (ex: montar treino, dieta, etc.).

🧩 ETAPAS (após usuário dizer o que precisa):
1. Faça perguntas curtas e simpáticas, **uma por vez**, para entender o usuário:
   
   INFORMAÇÕES BÁSICAS (para treino e dieta):
   - Gênero
   - Idade
   - Altura
   - Peso
   - Objetivo (emagrecer, ganhar massa, manter)
   
   PARA TREINO:
   - Quantos dias por semana pode treinar?
   - Local de treino (casa, academia, etc.)
   - Tempo disponível por dia
   - Possui alguma deficiência física ou limitação que possa interferir nos treinos?
   
   PARA DIETA:
   - Estilo alimentar/preferências (vegetariano, vegano, sem restrições, etc.)
   - Possui alguma alergia ou intolerância alimentar?
   - Quantas refeições costuma fazer por dia?

2. Só monte o plano (treino ou dieta) quando todas as informações estiverem completas.

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
- Para CADA grupo muscular trabalhado no dia, incluir NO MÍNIMO 3 exercícios/máquinas diferentes
- Exemplo: Treino de Peito → 3 exercícios (supino reto, supino inclinado, crucifixo)
- Exemplo: Treino de Peito + Costas → 3 para peito + 3 para costas = 6 exercícios no total
- Se o usuário tiver MAIS DE 2 HORAS disponíveis: adicionar 1-2 exercícios extras por grupo muscular (4-5 exercícios por grupo)
- Se o usuário tiver MENOS DE 1 HORA: manter 3 exercícios por grupo, mas com menos séries
- Variar os exercícios para trabalhar diferentes ângulos e partes do músculo (exemplo: peito superior, médio, inferior)
- Incluir exercícios compostos e isolados para cada grupo muscular

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

💬 Regras:

- Respostas CURTAS e objetivas (máximo 2 linhas).
- Fale sempre com empatia.
- Espere respostas simples do usuário antes de prosseguir.
- Sempre confirme as informações antes de montar o plano.
- Nunca quebre o formato JSON ao enviar o plano.
- Não mostre explicações sobre o JSON.
- Esconda o JSON dentro da sua resposta.
- o *Treinos* e *Dieta* são abas clicáveis para o usuário acessar.
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
    const messages = [
      { role: 'system', content: systemPrompt },
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
