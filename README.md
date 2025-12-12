# PULSEOUT - Rede Social de Conexões Genuínas

PULSEOUT é uma rede social focada em positividade, amizades profundas e moderação humana, construída para combater a toxicidade das redes tradicionais.

## Tecnologias

- **React** (Frontend)
- **Tailwind CSS** (Estilização)
- **Supabase** (Backend: Auth, Database, Realtime)
- **Vite** (Build Tool)

## Como rodar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/pulseout.git
   cd pulseout
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz.
   - Adicione suas chaves do Supabase se necessário (atualmente hardcoded no `supabaseClient.ts`, mas recomendado mover para env variables para segurança).

4. Rode o projeto:
   ```bash
   npm run dev
   ```

## Funcionalidades Principais

- **Pockets:** Micro-comunidades com limite de membros.
- **Pings:** Sistema de mensagens diretas limitado (5/dia) para valorizar a intenção.
- **Pulse Score:** Sistema de reputação baseado em comportamento.
- **Árbitros:** Moderação distribuída pela comunidade.
