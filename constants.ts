import { Pocket, Post, PingMsg } from './types';

// Daily Reflection Prompts
export const DAILY_PROMPTS = [
  "Qual foi a pequena vitória silenciosa do seu dia?",
  "O que você mudou de opinião recentemente?",
  "Qual conselho você daria para o seu 'eu' de 5 anos atrás?",
  "O que significa sucesso para você hoje, diferente de ontem?",
  "Descreva um momento de pura serenidade que você viveu."
];

// Helper to get consistent prompt based on date
export const getDailyPrompt = (): string => {
  const today = new Date().toDateString(); // e.g., "Mon Oct 27 2023"
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[index];
};

// Initial Pockets (Starter Communities)
export const MOCK_POCKETS: Pocket[] = [
  {
    id: 'genesis_1',
    name: 'Slow Living & Digital Detox',
    description: 'Um santuário para recuperar o foco. Discutimos minimalismo digital, intencionalidade e a vida fora das telas.',
    memberCount: 1, 
    maxMembers: 50,
    tags: ['Estilo de Vida', 'Mindfulness', 'Foco'],
    isMember: false,
    isCampfire: true, // CAMPFIRE MODE ENABLED
    campfireTime: 'Terças e Quintas, 19h-22h',
    applicationQuestions: [
      "Qual aplicativo mais drena sua energia hoje?",
      "O que você faria com 2 horas livres totalmente offline?",
      "Por que você busca uma vida mais lenta?"
    ]
  },
  {
    id: 'genesis_2',
    name: 'Cinema & Psicanálise',
    description: 'Analisando a sétima arte através das lentes de Freud, Jung e Lacan. Não é sobre a crítica técnica, é sobre a psique.',
    memberCount: 1,
    maxMembers: 50,
    tags: ['Cinema', 'Psicologia', 'Arte'],
    isMember: false,
    applicationQuestions: [
      "Qual filme mudou sua visão sobre si mesmo?",
      "Qual vilão você compreende profundamente?",
      "Você prefere finais felizes ou realistas?"
    ]
  },
  {
    id: 'genesis_3',
    name: 'Ética na Inteligência Artificial',
    description: 'Onde a tecnologia encontra a filosofia moral. Debates sobre o futuro da humanidade, trabalho e consciência.',
    memberCount: 1,
    maxMembers: 50,
    tags: ['Tecnologia', 'Filosofia', 'Futuro'],
    isMember: false,
    applicationQuestions: [
      "A IA pode ter consciência? Justifique.",
      "Qual o maior risco ético da tecnologia atual?",
      "Como você vê o papel do humano em 2050?"
    ]
  },
  {
    id: 'genesis_4',
    name: 'Leitura de Clássicos (Deep Work)',
    description: 'Compromisso com leituras densas e difíceis. Uma página por vez, com profundidade total.',
    memberCount: 1,
    maxMembers: 50,
    tags: ['Literatura', 'Estudo', 'Clássicos'],
    isMember: false,
    applicationQuestions: [
      "Qual o livro mais difícil que você já leu?",
      "Você prefere Dostoiévski ou Tolstói?",
      "Quanto tempo por dia você dedica à leitura?"
    ]
  }
];

// Empty Feed - Fresh Start for new users
export const MOCK_POSTS: Post[] = [
  {
    id: 'slow-post-1',
    userId: 'system-ai',
    userName: 'Sophia (Ethics)',
    userAvatar: 'https://picsum.photos/seed/sophia/200',
    userDominantReaction: 'P',
    content: "O 'Slow-Motion Debate' está ativo aqui. \n\nA questão é: Deveríamos pausar o desenvolvimento de IAs generativas por 6 meses para criar regulamentação global?\n\n(Nesta thread, você só pode responder uma vez a cada 30 minutos. Pense antes de escrever.)",
    timestamp: '2h atrás',
    depthBadge: true,
    isSlowMode: true, // SLOW MODE ENABLED
    reactions: { I: 12, P: 4, A: 25, T: 8 },
    pocketId: 'genesis_3',
    pocketName: 'Ética na Inteligência Artificial',
    comments: [
      {
        id: 'c1',
        userId: 'u2',
        userName: 'Alan T.',
        userAvatar: 'https://picsum.photos/seed/alan/200',
        content: 'Pausar é impossível tecnicamente. O código já está lá fora (open source). A regulação deve focar no uso final, não no desenvolvimento.',
        timestamp: '1h atrás'
      }
    ]
  }
];

export const MOCK_PINGS: PingMsg[] = [
  {
    id: 'p1',
    fromUser: 'Ana (Cinema)',
    fromAvatar: 'https://picsum.photos/seed/ana/200',
    context: 'Sobre sua análise de Matrix e Platão',
    timestamp: 'Ontem',
    isRead: false,
    messages: [
        {
            id: 'm1',
            senderId: 'other',
            text: 'Olá! Li seu post sobre a Alegoria da Caverna em Matrix. Fiquei muito impactada com a conexão que você fez com as redes sociais atuais.',
            timestamp: 'Ontem 14:30'
        },
        {
            id: 'm2',
            senderId: 'other',
            text: 'Você acha que Cypher estava certo em querer voltar para a ilusão?',
            timestamp: 'Ontem 14:32'
        }
    ]
  },
  {
    id: 'p2',
    fromUser: 'Carlos.dev',
    fromAvatar: 'https://picsum.photos/seed/carlos/200',
    context: 'Vi que você gosta de estoicismo. Queria compartilhar um livro.',
    timestamp: '2 dias atrás',
    isRead: true,
    messages: [
        {
            id: 'm1',
            senderId: 'other',
            text: 'E aí! Vi seus comentários no pocket de Slow Living.',
            timestamp: '2 dias atrás'
        },
        {
            id: 'm2',
            senderId: 'other',
            text: 'Já leu "Meditações" de Marco Aurélio? Acho que combina muito com o que você disse sobre controle interno.',
            timestamp: '2 dias atrás'
        },
        {
            id: 'm3',
            senderId: 'me',
            text: 'Oi Carlos! Sim, é meu livro de cabeceira. Adoro a parte onde ele fala sobre acordar cedo e fazer o trabalho de um ser humano.',
            timestamp: '1 dia atrás'
        }
    ]
  }
];

export const MOCK_REPORTS = [
  {
    id: 'r1',
    author: 'System',
    content: 'Teste de denúncia de sistema.',
    reason: 'Teste',
    severity: 'Low'
  }
];

export const NON_TOXICITY_PACT = `
Eu me comprometo a interagir com intenção e empatia.
Reconheço que por trás de cada tela existe um ser humano.
Prometo discordar com respeito, evitando ataques pessoais.
Entendo que minha pontuação (PULSE Score) reflete minha contribuição para a saúde da comunidade.
`;