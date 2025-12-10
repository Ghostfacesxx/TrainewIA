# 🏋️ TrainewIA

> Aplicativo inteligente de treinos e dieta com IA integrada e análise nutricional por imagem.

![Node.js](https://img.shields.io/badge/Node.js-v20.x-green)
![Express](https://img.shields.io/badge/Express-v5.1.0-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange)

**Desenvolvido por:** João Pedro, Gabriel, Izabela e Ana Clara  
**Instituição:** Senac Patos de Minas

---

## 📖 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)
- [Acessibilidade](#acessibilidade)
- [Contribuição](#contribuição)

---

## 🎯 Sobre o Projeto

O **TrainewIA** é uma aplicação web completa para geração de treinos e dietas personalizadas utilizando Inteligência Artificial. O sistema permite que usuários interajam com um chatbot inteligente para criar planos de treino e alimentação, além de analisar fotografias de alimentos para obter informações nutricionais detalhadas.

### Diferenciais:
- 🤖 **IA Avançada**: Integração com OpenAI GPT-4o-mini para conversas naturais e inteligentes
- 📸 **Análise de Imagens**: Tecnologia de visão computacional para análise nutricional de fotos
- 🎨 **Interface Moderna**: Design responsivo com tema claro/escuro
- ♿ **Acessível**: Sistema completo de controle de tamanho de fonte (5 níveis)
- 📱 **Mobile-First**: Totalmente otimizado para dispositivos móveis com suporte a gestos touch

---

## ✨ Funcionalidades

### 💬 Chat Inteligente
- Geração de planos de treino personalizados com mínimo 3 exercícios por grupo muscular
- Criação de dietas balanceadas com distribuição semanal completa
- Animação de digitação para melhor experiência de conversa
- Histórico de conversas salvo localmente
- Contexto de memória: IA lembra das dietas e treinos criados anteriormente

### 🍎 Análise Nutricional
- Upload de fotos de alimentos (suporta HEIC, HEIF, JPG, PNG, WebP)
- Captura direta pela câmera do dispositivo
- Análise automática de calorias, proteínas, carboidratos e gorduras
- Histórico das últimas 10 análises
- Visualização detalhada das informações nutricionais

### 📊 Gestão de Treinos e Dietas
- Visualização em cards por dia da semana
- Sistema de modais com detalhes completos
- Organização inteligente por grupos musculares
- Opção de editar ou excluir planos salvos
- Interface com scroll suave e animações

### 🌓 Temas e Personalização
- Tema claro e escuro com transição suave
- Persistência de preferências do usuário
- Cores otimizadas para legibilidade em ambos os temas
- Design adaptável a diferentes tamanhos de tela

### ♿ Acessibilidade
- 5 níveis de tamanho de fonte (13px a 20px)
- Slider visual para controle de fonte
- Aplicação global em todas as páginas
- Manutenção da estética em todos os tamanhos
- Documentação completa na página de ajuda

### 📱 Mobile Responsivo
- Viewport dinâmico (100dvh) para teclado virtual
- Suporte a gestos de swipe no carrossel
- Touch-friendly com áreas de toque adequadas
- Fonte base de 16px para prevenir zoom no iOS
- Feedback visual para interações touch (cursor grab/grabbing)

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** v20.x - Runtime JavaScript
- **Express** v5.1.0 - Framework web
- **OpenAI API** - Integração com GPT-4o-mini e GPT-4o-mini with Vision
- **dotenv** - Gerenciamento de variáveis de ambiente
- **cors** - Habilitação de CORS
- **heic-convert** - Conversão de imagens HEIC/HEIF

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização modular com variáveis CSS
- **JavaScript ES6+** - Lógica da aplicação
- **LocalStorage** - Persistência de dados no cliente

### APIs
- **OpenAI Chat Completions API** - Geração de treinos e dietas
- **OpenAI Vision API** - Análise de imagens de alimentos

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** v20.x ou superior ([Download](https://nodejs.org/))
- **npm** v9.x ou superior (incluído com Node.js)
- **Chave da API OpenAI** ([Obter chave](https://platform.openai.com/api-keys))

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Ghostfacesxx/TrainewIA.git
cd TrainewIA
```

### 2. Instale as dependências

```bash
npm install
```

Isso instalará 73 pacotes necessários, incluindo:
- express v5.1.0
- openai v4.76.1
- dotenv v16.4.7
- cors v2.8.5
- heic-convert v2.1.0

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
OPENAI_API_KEY=sua_chave_api_aqui
PORT=3000
```

---

## ⚙️ Configuração

### Chave da API OpenAI

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Navegue até [API Keys](https://platform.openai.com/api-keys)
4. Clique em "Create new secret key"
5. Copie a chave e adicione ao arquivo `.env`

### Limites e Configurações

- **Tamanho máximo de upload**: 50MB (configurado para suportar imagens em alta resolução)
- **Modelo de chat**: GPT-4o-mini
- **Modelo de visão**: GPT-4o-mini with Vision
- **Porta padrão**: 3000

---

## 🎮 Como Usar

### Iniciar o servidor

```bash
npm start
```

O servidor será iniciado em `http://localhost:3000`

### Acessar a aplicação

Abra o navegador e acesse:
```
http://localhost:3000
```

### Fluxo de Uso

1. **Cadastro**: Crie sua conta na página de cadastro
2. **Login**: Acesse com suas credenciais
3. **Chat**: Peça para a IA criar seu treino ou dieta
   - Exemplo: "Crie um treino de hipertrofia para 5 dias"
   - Exemplo: "Monte uma dieta de 2000 calorias"
4. **Alimentação**: Envie fotos de alimentos para análise nutricional
5. **Visualização**: Acesse as abas "Treino" e "Dieta" para ver seus planos
6. **Configurações**: Ajuste o tema e tamanho da fonte em "Configurações"

---

## 📁 Estrutura do Projeto

```
TrainewIA-main/
├── server.js                 # Servidor Express e rotas da API
├── package.json             # Dependências e scripts
├── render.yaml              # Configuração para deploy no Render
├── .env                     # Variáveis de ambiente (não versionado)
├── index.html               # Página inicial de login
├── README.md                # Documentação do projeto
│
├── css/                     # Folhas de estilo modulares
│   ├── style.css           # Estilos globais e variáveis CSS
│   ├── dark-theme.css      # Estilos do tema escuro
│   ├── header.css          # Estilos do cabeçalho
│   ├── inicio.css          # Estilos da página inicial/carrossel
│   ├── sobre.css           # Estilos da página sobre
│   ├── chat.css            # Estilos do chat com IA
│   └── accessibility.css   # Estilos de acessibilidade (fontes)
│
├── js/                      # Scripts JavaScript
│   ├── theme-manager.js    # Gerenciador de temas claro/escuro
│   └── font-manager.js     # Gerenciador de tamanho de fonte
│
└── public/                  # Páginas HTML públicas
    ├── index.html          # Dashboard principal
    ├── inicio.html         # Página inicial com carrossel
    ├── cadastro.html       # Formulário de cadastro
    ├── chat.html           # Interface do chat com IA
    ├── treino.html         # Visualização de treinos
    ├── dieta.html          # Visualização de dietas
    ├── config.html         # Página de configurações
    ├── sobre.html          # Sobre o projeto e equipe
    ├── ajuda.html          # FAQ e ajuda
    └── img/                # Imagens e ícones
        ├── logo.png
        ├── dumbbell.png
        ├── apple.png
        └── ...
```

---

## 🌐 Deploy

### Deploy no Render

O projeto está configurado para deploy automático no Render.

#### Passo a passo:

1. **Crie uma conta no Render**: [render.com](https://render.com/)

2. **Novo Web Service**:
   - Conecte seu repositório GitHub
   - Selecione o repositório TrainewIA
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

3. **Variáveis de Ambiente**:
   - Adicione `OPENAI_API_KEY` com sua chave da API

4. **Deploy**:
   - O Render detectará automaticamente o `render.yaml`
   - O deploy será iniciado automaticamente

#### Arquivo render.yaml

```yaml
services:
  - type: web
    name: trainewia
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: OPENAI_API_KEY
        sync: false
```

### Outros Serviços de Deploy

O projeto também pode ser hospedado em:
- **Heroku**: Configure Procfile e variáveis de ambiente
- **Railway**: Deploy direto do GitHub
- **DigitalOcean App Platform**: Configure via UI ou .do/app.yaml
- **AWS EC2**: Configure manualmente com PM2

---

## ♿ Acessibilidade

O TrainewIA foi desenvolvido com foco em acessibilidade:

### Controle de Tamanho de Fonte

- **5 Níveis Disponíveis**:
  - Pequena: 13px
  - Média-Pequena: 14px
  - Normal: 16px (padrão)
  - Média-Grande: 18px
  - Grande: 20px

- **Como Usar**:
  1. Acesse "Configurações"
  2. Use o slider "Tamanho da Fonte"
  3. A alteração é aplicada imediatamente em todas as páginas
  4. A preferência é salva automaticamente

- **Otimizações**:
  - Escala proporcional de todos os elementos
  - Limite de 18px em mobile para evitar quebra de layout
  - Manutenção da estética em todos os tamanhos
  - Persistência via LocalStorage

### Outras Funcionalidades de Acessibilidade

- Contraste adequado em ambos os temas
- Estrutura semântica HTML5
- Navegação por teclado
- Texto alternativo em imagens
- Feedback visual para interações

---

## 🤝 Contribuição

Contribuições são bem-vindas! Se você deseja melhorar o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Mantenha o código limpo e bem documentado
- Siga os padrões de código existentes
- Teste suas alterações antes de enviar
- Atualize a documentação quando necessário

---

## 📄 Licença

Este projeto foi desenvolvido como trabalho acadêmico no Senac Patos de Minas.

---

## 👥 Equipe de Desenvolvimento

- **João Pedro** - Desenvolvimento Full Stack
- **Gabriel** - Desenvolvimento Full Stack
- **Izabela** - Desenvolvimento Full Stack
- **Ana Clara** - Desenvolvimento Full Stack

**Instituição**: Senac Patos de Minas  
**Ano**: 2025

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a página de [Ajuda](public/ajuda.html) no aplicativo
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

## 🙏 Agradecimentos

- OpenAI pela API de IA
- Senac Patos de Minas pelo suporte educacional
- Comunidade open-source pelas bibliotecas utilizadas

---

<div align="center">

**TrainewIA: Transformando seu esforço em resultados reais**

[⬆ Voltar ao topo](#-trainewia)

</div>