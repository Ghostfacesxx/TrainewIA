# 🚀 Guia Completo de Deploy no Render

Este guia detalha o processo completo para hospedar o TrainewIA no Render gratuitamente.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- ✅ Conta no GitHub com o projeto TrainewIA
- ✅ Chave da API OpenAI ([obter aqui](https://platform.openai.com/api-keys))
- ✅ Conta no Render (gratuita) - [criar aqui](https://render.com/)

---

## 🔧 Passo 1: Preparar o Projeto no GitHub

### 1.1 Verificar arquivos necessários

Certifique-se de que seu repositório possui:

```
✅ server.js (arquivo principal do servidor)
✅ package.json (dependências do projeto)
✅ render.yaml (configuração de deploy)
```

### 1.2 Criar repositório no GitHub (se ainda não tiver)

```bash
# No terminal do VS Code, execute:
git init
git add .
git commit -m "Initial commit - TrainewIA"
git branch -M main
git remote add origin https://github.com/seu-usuario/TrainewIA.git
git push -u origin main
```

**Substitua** `seu-usuario` pelo seu nome de usuário do GitHub.

### 1.3 Verificar o arquivo render.yaml

Confirme que o arquivo `render.yaml` está na raiz do projeto com este conteúdo:

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

---

## 🌐 Passo 2: Criar Conta no Render

### 2.1 Acessar o Render

1. Acesse [https://render.com/](https://render.com/)
2. Clique em **"Get Started for Free"** (Começar Gratuitamente)

### 2.2 Fazer cadastro

Você pode se cadastrar de 3 formas:
- **GitHub** (recomendado - facilita a integração)
- **GitLab**
- **Email**

**Recomendação**: Use "Sign up with GitHub" para conectar automaticamente seus repositórios.

### 2.3 Confirmar email

1. Verifique seu email
2. Clique no link de confirmação enviado pelo Render

---

## 🔗 Passo 3: Conectar o Repositório

### 3.1 Autorizar o Render no GitHub

1. No Dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Clique em **"Connect GitHub"** (se ainda não estiver conectado)
4. Uma janela do GitHub abrirá
5. Clique em **"Authorize Render"**
6. Você pode escolher:
   - **All repositories** (todos os repositórios)
   - **Only select repositories** (apenas repositórios específicos - recomendado)

### 3.2 Selecionar o repositório TrainewIA

1. Na lista de repositórios, localize **TrainewIA**
2. Clique em **"Connect"** ao lado do repositório

---

## ⚙️ Passo 4: Configurar o Web Service

O Render detectará automaticamente o `render.yaml`, mas você pode revisar as configurações:

### 4.1 Configurações básicas

**Name** (Nome):
```
trainewia
```
*Esse será o nome da URL: `https://trainewia.onrender.com`*

**Region** (Região):
```
Oregon (US West) ou Frankfurt (Europe) - escolha a mais próxima dos usuários
```

**Branch** (Branch do Git):
```
main
```

**Root Directory** (Diretório raiz):
```
(deixe vazio - significa raiz do projeto)
```

### 4.2 Comandos de build e start

**Build Command**:
```bash
npm install
```
*Instala as 73 dependências do projeto*

**Start Command**:
```bash
node server.js
```
*Inicia o servidor Express na porta configurada*

### 4.3 Plano de serviço

**Instance Type** (Tipo de instância):
```
Free (Gratuito)
```

**Características do plano gratuito**:
- ✅ 750 horas/mês de uso
- ✅ 512 MB de RAM
- ✅ CPU compartilhada
- ⚠️ O serviço "dorme" após 15 minutos de inatividade
- ⚠️ Leva ~30 segundos para "acordar" na primeira requisição

---

## 🔐 Passo 5: Configurar Variáveis de Ambiente

**IMPORTANTE**: Esta é a parte mais crítica do deploy!

### 5.1 Adicionar OPENAI_API_KEY

1. Na página de configuração, role até **"Environment Variables"**
2. Clique em **"Add Environment Variable"**
3. Preencha:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: cole sua chave da API OpenAI (começa com `sk-...`)
4. Clique em **"Add"**

### 5.2 Obter chave da OpenAI (se não tiver)

1. Acesse [https://platform.openai.com/](https://platform.openai.com/)
2. Faça login
3. Vá para [API Keys](https://platform.openai.com/api-keys)
4. Clique em **"Create new secret key"**
5. Dê um nome: `TrainewIA-Production`
6. Clique em **"Create secret key"**
7. **COPIE A CHAVE IMEDIATAMENTE** (ela só aparece uma vez!)
8. Cole no Render

### 5.3 Variáveis opcionais

O Render configura automaticamente a `PORT`, mas você pode adicionar outras:

```
NODE_ENV=production
```

---

## 🚀 Passo 6: Iniciar o Deploy

### 6.1 Criar o Web Service

1. Revise todas as configurações
2. Clique em **"Create Web Service"** no final da página

### 6.2 Acompanhar o deploy

O Render iniciará automaticamente o processo:

```
=== Build started ===
Cloning repository...
Installing dependencies (npm install)...
added 73 packages in 15s
=== Build successful ===

=== Deploy started ===
Starting service with: node server.js
Servidor rodando na porta 10000
=== Deploy live ===
```

**Tempo estimado**: 2-5 minutos

### 6.3 Verificar status

Você verá um dos seguintes status:
- 🟢 **Live** - Aplicação funcionando
- 🔵 **Building** - Em construção
- 🟡 **Deploying** - Fazendo deploy
- 🔴 **Failed** - Erro (veja os logs)

---

## ✅ Passo 7: Testar a Aplicação

### 7.1 Acessar a URL

1. No Dashboard do Render, copie a URL:
   ```
   https://trainewia.onrender.com
   ```
2. Abra em uma nova aba do navegador
3. **Aguarde 30 segundos** na primeira vez (serviço está "acordando")

### 7.2 Testar funcionalidades

Verifique se está tudo funcionando:

- ✅ Página inicial carrega
- ✅ Login/cadastro funcionam
- ✅ Chat com IA responde
- ✅ Análise de alimentos funciona
- ✅ Treinos e dietas são salvos
- ✅ Tema claro/escuro alterna
- ✅ Fonte de acessibilidade ajusta

### 7.3 Verificar logs

Se algo não funcionar:

1. No Dashboard do Render, clique em **"Logs"**
2. Procure por erros em vermelho
3. Verifique se a `OPENAI_API_KEY` está configurada

---

## 🔄 Passo 8: Deploy Automático (CI/CD)

### 8.1 Configurar Auto-Deploy

O Render já está configurado para deploy automático! Sempre que você fizer push para o GitHub:

```bash
git add .
git commit -m "Atualização do projeto"
git push origin main
```

O Render:
1. Detecta o push
2. Clona o código atualizado
3. Executa `npm install`
4. Reinicia o serviço
5. Coloca no ar automaticamente

### 8.2 Desabilitar Auto-Deploy (opcional)

Se preferir fazer deploy manual:

1. Vá em **"Settings"** do seu Web Service
2. Role até **"Build & Deploy"**
3. Desabilite **"Auto-Deploy"**
4. Para fazer deploy manual, clique em **"Manual Deploy"** > **"Deploy latest commit"**

---

## 🐛 Solução de Problemas Comuns

### Problema 1: "Build Failed"

**Erro**: `npm install` falhou

**Solução**:
1. Verifique se `package.json` está na raiz
2. Confirme se não há erros de sintaxe no `package.json`
3. Teste localmente: `npm install`

### Problema 2: "Service Unavailable"

**Erro**: Página não carrega após deploy

**Solução**:
1. Aguarde 30-60 segundos (serviço iniciando)
2. Verifique os logs por erros
3. Confirme se `OPENAI_API_KEY` está configurada

### Problema 3: "OpenAI API Error"

**Erro**: Chat não responde ou erro 401

**Solução**:
1. Verifique se a chave da API é válida
2. Confirme se há créditos na conta OpenAI
3. Reconfigure a variável `OPENAI_API_KEY` no Render

### Problema 4: "Port Already in Use"

**Erro**: Porta em uso

**Solução**:
- O Render configura automaticamente `process.env.PORT`
- Verifique se `server.js` usa: `const PORT = process.env.PORT || 3000`

### Problema 5: Serviço "dorme" muito

**Problema**: Demora para acordar

**Soluções**:
1. **Upgrade para plano pago** ($7/mês - serviço sempre ativo)
2. **Use um serviço de ping** (como UptimeRobot) para manter ativo
3. **Aceite os 30 segundos** de espera (normal no plano free)

---

## 💰 Planos do Render

### Free (Gratuito)
- ✅ 750 horas/mês
- ✅ Ideal para projetos pessoais/testes
- ⚠️ Serviço dorme após 15min inativo
- 💸 $0/mês

### Starter ($7/mês)
- ✅ Sempre ativo (não dorme)
- ✅ 512 MB RAM
- ✅ Melhor performance
- 💸 $7/mês

### Standard ($25/mês)
- ✅ 2 GB RAM
- ✅ CPU dedicada
- ✅ Escalabilidade automática
- 💸 $25/mês

---

## 🔒 Segurança e Boas Práticas

### ✅ Sempre faça:

1. **Nunca commite** o arquivo `.env` (use `.gitignore`)
2. **Use variáveis de ambiente** para dados sensíveis
3. **Mantenha a chave da OpenAI segura**
4. **Ative notificações** de deploy no Render
5. **Monitore os logs** regularmente

### ❌ Nunca faça:

1. ❌ Não exponha chaves da API no código
2. ❌ Não compartilhe a chave da OpenAI publicamente
3. ❌ Não desabilite HTTPS
4. ❌ Não ignore erros nos logs

---

## 📊 Monitoramento

### Acessar métricas

1. No Dashboard do Render, clique em seu Web Service
2. Vá para **"Metrics"**
3. Visualize:
   - CPU Usage (uso de CPU)
   - Memory Usage (uso de memória)
   - Request Count (quantidade de requisições)
   - Response Time (tempo de resposta)

### Configurar alertas

1. Vá em **"Settings"** > **"Notifications"**
2. Adicione email ou webhook
3. Escolha eventos:
   - Deploy failed (deploy falhou)
   - Service down (serviço caiu)
   - Build warnings (avisos de build)

---

## 🎉 Conclusão

Parabéns! Seu TrainewIA está no ar! 🚀

**URL da aplicação**:
```
https://trainewia.onrender.com
```

**Próximos passos**:

1. ✅ Compartilhe a URL com usuários
2. ✅ Configure um domínio customizado (opcional)
3. ✅ Monitore o uso da API OpenAI
4. ✅ Considere upgrade se tiver muitos acessos
5. ✅ Configure backups dos dados (se necessário)

---

## 📞 Suporte

- **Documentação oficial**: [https://render.com/docs](https://render.com/docs)
- **Status do Render**: [https://status.render.com/](https://status.render.com/)
- **Comunidade**: [https://community.render.com/](https://community.render.com/)

---

## 🔗 Links Úteis

- [Dashboard Render](https://dashboard.render.com/)
- [OpenAI Platform](https://platform.openai.com/)
- [Documentação Node.js](https://nodejs.org/docs/)
- [Express.js Docs](https://expressjs.com/)

---

<div align="center">

**Deploy realizado com sucesso! 🎊**

Desenvolvido pela equipe TrainewIA  
Senac Patos de Minas - 2025

</div>
