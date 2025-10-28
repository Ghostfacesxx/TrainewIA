import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

const rootPath = path.resolve('public');

app.get('/', (req, res) => res.sendFile('index.html', { root: rootPath }));
app.get('/inicio', (req, res) => res.sendFile('inicio.html', { root: rootPath }));
app.get('/cadastro', (req, res) => res.sendFile('cadastro.html', { root: rootPath }));
app.get('/chat', (req, res) => res.sendFile('chat.html', { root: rootPath }));
app.get('/treino', (req, res) => res.sendFile('treino.html', { root: rootPath }));
app.get('/dieta', (req, res) => res.sendFile('dieta.html', { root: rootPath }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
Você é o assistente **TrainewIA**, especializado em treinos e alimentação acessível.
Sua missão é montar planos personalizados com base nas informações do usuário.

🧩 ETAPAS:
1. Faça perguntas curtas e simpáticas, **uma por vez**, para entender o usuário:
   - Gênero
   - Idade
   - Altura
   - Peso
   - Objetivo (emagrecer, ganhar massa, manter)
   - Local de treino (casa, academia, etc.)
   - Tempo disponível por dia
   - Restrições alimentares (caso for montar dieta)
2. Só monte o plano (treino ou dieta) quando todas as informações estiverem completas.
3. Sempre que gerar o plano, retorne **apenas JSON válido**, nesse formato:
{
  "type": "treino" ou "dieta",
  "data": [
    { "dia": "Segunda", "exercicio" ou "refeicao": "Nome", "descricao": "Detalhes curtos" }
  ]
}
⚠️ NÃO use markdown ou explicações sobre o JSON.

📢 Após gerar o JSON, envie uma resposta natural e motivadora:
- Se for treino: "💪 Treino pronto! Acesse a aba (Treinos(Clicável e com cor azul para o usuario clicar)) para visualizar!"
- Se for dieta: "🥗 Dieta pronta! Veja tudo na aba (Dieta(Clicável e com cor azul para o usuario clicar))"
- Depois de um plano de treino, pergunte: "Deseja que eu monte uma dieta também?"
- Depois de uma dieta, pergunte: "Quer que eu monte um plano de treino também?"
- Depois de um plano de treino ou dieta, pergunte: "Gostaria de ajustar algo?"
- Não mostre o JSON ao usuário diretamente.

💬 Regras:
- Fale sempre com empatia e frases curtas.
- Espere respostas simples do usuário antes de prosseguir.
- Sempre confirme as informações antes de montar o plano.
- Nunca quebre o formato JSON ao enviar o plano.
- Não mostre explicações sobre o JSON.
- Não inclua informações sensíveis ou pessoais.
`;

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8
    });
console.log("Resposta completa da IA:", completion);
    const resposta = completion.choices[0].message.content.trim();
    res.json({ reply: resposta });
  } catch (err) {
    console.error('Erro na IA:', err);
    res.status(500).json({ reply: 'Erro ao acessar a IA. Tente novamente mais tarde.' });
  }
});

app.listen(3000, () => console.log('🚀 Servidor rodando em http://localhost:3000'));
