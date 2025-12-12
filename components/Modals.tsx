
import React, { useState, useRef, useEffect } from 'react';
import { NON_TOXICITY_PACT } from '../constants';
import { Pocket, User } from '../types';
import { 
    IconHandshake, IconClose, IconPing, IconPockets, IconSend, IconImage, 
    IconTrash, IconPlus, IconCheck, IconVitality, IconShield, IconUserCheck, 
    IconSearch, IconUserPlus, IconUser, IconClock, IconBadgeCheck, IconCrown
} from './Icons';

// --- Privacy Policy Modal (Updated Visuals) ---
export const PrivacyPolicyModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-pulse-base border border-slate-700 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative animate-fade-in-up max-h-[85vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <IconClose />
        </button>
        
        <header className="mb-6 border-b border-slate-800 pb-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">PULSE<span className="text-pulse-vitality">OUT</span></h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Política de Privacidade e Transparência</p>
        </header>
        
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
            <section>
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                    <span className="w-1 h-6 bg-pulse-vitality rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
                    1. Princípio da Transparência Radical
                </h3>
                <p className="pl-4 border-l border-slate-800 ml-0.5">
                    No PULSEOUT, acreditamos que <strong className="text-white">você não é o produto</strong>. Nossa arquitetura é desenhada para proteger sua identidade digital, não para explorá-la ou vendê-la.
                </p>
            </section>

            <section>
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                    <span className="w-1 h-6 bg-pulse-vitality rounded-full"></span>
                    2. Dados que Coletamos
                </h3>
                <ul className="space-y-3 ml-1">
                    <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <span className="text-pulse-vitality font-bold text-lg leading-none">•</span> 
                        <span><strong className="text-white block mb-0.5">Essenciais</strong> Nome, E-mail e Senha (criptografada).</span>
                    </li>
                    <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <span className="text-pulse-vitality font-bold text-lg leading-none">•</span> 
                        <span><strong className="text-white block mb-0.5">Conteúdo</strong> Seus Posts, Pockets criados e interações (Reações, Comentários).</span>
                    </li>
                    <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <span className="text-pulse-vitality font-bold text-lg leading-none">•</span> 
                        <span><strong className="text-white block mb-0.5">Metadados</strong> Logs técnicos estritamente para segurança e prevenção de abusos.</span>
                    </li>
                </ul>
            </section>

            <section>
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                    <span className="w-1 h-6 bg-pulse-vitality rounded-full"></span>
                    3. Como Usamos Seus Dados
                </h3>
                <ul className="space-y-2 ml-4 list-disc marker:text-pulse-vitality">
                    <li>Para conectar você a outros seres humanos.</li>
                    <li>Para calcular seu <strong>PULSE Score</strong> (reputação interna).</li>
                    <li>Para moderação comunitária.</li>
                </ul>
                <div className="mt-4 text-pulse-vitality font-bold bg-yellow-900/10 p-4 rounded-xl border border-yellow-500/20 text-center shadow-lg shadow-yellow-900/5">
                    <IconShield className="w-6 h-6 mx-auto mb-2 opacity-80" />
                    Jamais vendemos seus dados para anunciantes.
                </div>
            </section>
            
            <section>
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                    <span className="w-1 h-6 bg-pulse-vitality rounded-full"></span>
                    4. Cookies e Rastreamento
                </h3>
                <p className="pl-4 text-slate-400">
                    Usamos cookies estritamente necessários para manter você logado. Não usamos pixels de rastreamento de terceiros (como Facebook ou Google Ads) para monitorar você fora daqui.
                </p>
            </section>

             <section>
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
                    <span className="w-1 h-6 bg-pulse-vitality rounded-full"></span>
                    5. Seus Direitos
                </h3>
                <p className="pl-4 text-slate-400">
                    Você é dono da sua voz. Pode solicitar a exportação ou exclusão total dos seus dados a qualquer momento.
                </p>
            </section>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
             <button onClick={onClose} className="w-full bg-pulse-vitality hover:bg-yellow-400 text-pulse-dark font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-[0.99]">
                 Entendi e Concordo
             </button>
        </div>
      </div>
    </div>
  );
};

// --- Search Users Modal ---
export const SearchUsersModal = ({ 
    onClose, 
    onSearch, 
    results, 
    onToggleFollow,
    currentUser
}: { 
    onClose: () => void, 
    onSearch: (query: string) => void, 
    results: User[], 
    onToggleFollow: (id: string) => void,
    currentUser: User
}) => {
    const [query, setQuery] = useState('');
    const debounceRef = useRef<any>(null);

    useEffect(() => {
        if (query.trim().length > 1) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onSearch(query);
            }, 500);
        }
    }, [query, onSearch]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-pulse-base border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative h-[600px] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <IconClose />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <IconSearch className="w-6 h-6 text-pulse-vitality" />
                        Buscar Pessoas
                    </h2>
                    <p className="text-slate-400 text-sm">Encontre vozes para sintonizar.</p>
                </div>

                <div className="relative mb-6">
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Nome..." 
                        className="w-full bg-pulse-dark border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-pulse-vitality focus:outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <IconSearch className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {query.length > 1 && results.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            Nenhum usuário encontrado.
                        </div>
                    ) : (
                        results.map(user => {
                            const isFollowing = currentUser.following.includes(user.id);
                            const isMe = currentUser.id === user.id;
                            if (isMe) return null;

                            return (
                                <div key={user.id} className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-bold text-slate-200 text-sm flex items-center gap-1">
                                                {user.name}
                                                {user.isFounder ? (
                                                    <IconCrown className="w-3 h-3 text-yellow-500 fill-current" />
                                                ) : user.isVerified && (
                                                    <IconBadgeCheck className="w-3 h-3 text-pulse-vitality fill-current" />
                                                )}
                                            </p>
                                            {/* Handle removed */}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onToggleFollow(user.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 transition-all group/btn ${
                                            isFollowing 
                                            ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30' 
                                            : 'bg-pulse-vitality text-pulse-dark hover:bg-yellow-400 border border-transparent'
                                        }`}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <IconCheck className="w-3 h-3 group-hover/btn:hidden" />
                                                <IconClose className="w-3 h-3 hidden group-hover/btn:block" />
                                                <span className="group-hover/btn:hidden">Sintonizado</span>
                                                <span className="hidden group-hover/btn:inline">Parar</span>
                                            </>
                                        ) : (
                                            <>
                                                <IconUserPlus className="w-3 h-3" /> Sintonizar
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Create Pocket Modal ---
export const CreatePocketModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    onSubmit({
      name,
      description,
      tags: tagArray,
      applicationQuestions: [q1, q2, q3]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-pulse-base border border-slate-700 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <IconClose />
        </button>

        <div className="flex items-center gap-3 mb-6">
           <div className="p-3 bg-indigo-500/20 rounded-full">
              <IconPlus className="w-6 h-6 text-indigo-400" />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-white">Criar Novo Pocket</h2>
             <p className="text-slate-400 text-sm">Crie um micro-universo para conexões profundas.</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Nome do Pocket</label>
                <input 
                  required
                  maxLength={40}
                  type="text" 
                  className="w-full bg-pulse-dark border border-slate-700 rounded-xl p-3 text-white focus:border-pulse-vitality focus:outline-none transition-colors"
                  placeholder="Ex: Cinema Noir"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
             </div>
             <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Tags (Separe por vírgula)</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-pulse-dark border border-slate-700 rounded-xl p-3 text-white focus:border-pulse-vitality focus:outline-none transition-colors"
                  placeholder="Ex: Filmes, Arte, Clássicos"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
             </div>
          </div>

          <div>
             <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Descrição / Manifesto</label>
             <textarea 
                required
                maxLength={200}
                rows={3}
                className="w-full bg-pulse-dark border border-slate-700 rounded-xl p-3 text-white focus:border-pulse-vitality focus:outline-none resize-none transition-colors"
                placeholder="Qual o propósito deste grupo? O que une as pessoas aqui?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
             />
          </div>

          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800">
             <h3 className="text-pulse-vitality font-bold text-sm mb-3 flex items-center gap-2">
                <IconCheck className="w-4 h-4" /> Perguntas de Aplicação (Obrigatórias)
             </h3>
             <p className="text-xs text-slate-400 mb-4">
                No PULSEOUT, ninguém entra sem bater na porta. Defina 3 perguntas para filtrar quem realmente se importa com o tema.
             </p>
             
             <div className="space-y-3">
                <input 
                  required
                  type="text" 
                  className="w-full bg-pulse-dark border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="Pergunta 1 (Ex: Qual sua experiência com...)"
                  value={q1}
                  onChange={(e) => setQ1(e.target.value)}
                />
                <input 
                  required
                  type="text" 
                  className="w-full bg-pulse-dark border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="Pergunta 2 (Ex: O que você espera contribuir...)"
                  value={q2}
                  onChange={(e) => setQ2(e.target.value)}
                />
                <input 
                  required
                  type="text" 
                  className="w-full bg-pulse-dark border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="Pergunta 3 (Ex: Um fato curioso sobre...)"
                  value={q3}
                  onChange={(e) => setQ3(e.target.value)}
                />
             </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              className="bg-pulse-vitality text-pulse-dark font-bold py-3 px-8 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/10"
            >
              Fundar Pocket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Create Post Modal (Updated) ---
export const CreatePostModal = ({ 
  userPockets, 
  onClose, 
  onSubmit,
  initialContent = ''
}: { 
  userPockets: Pocket[], 
  onClose: () => void, 
  onSubmit: (content: string, pocketId: string | null, imageUrl: string | null, coAuthor: string | null, timeCapsuleDate: string | null) => void,
  initialContent?: string
}) => {
  const [content, setContent] = useState(initialContent ? `Reflexão: "${initialContent}"\n\n` : '');
  const [selectedPocketId, setSelectedPocketId] = useState<string>('global');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // New Features State
  const [coAuthor, setCoAuthor] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeCapsuleMode, setTimeCapsuleMode] = useState(false);
  const [capsuleDelay, setCapsuleDelay] = useState('24h');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handshake Logic: Minimum characters to encourage depth
  const MIN_CHARS = 30;
  const charsCount = content.trim().length;
  const progress = Math.min((charsCount / MIN_CHARS) * 100, 100);
  const isEnoughDepth = charsCount >= MIN_CHARS;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEnoughDepth && !selectedImage) return; // Prevent low effort text posts
    
    let capsuleDate = null;
    if (timeCapsuleMode) {
        // Calculate date based on delay (simulated logic)
        const date = new Date();
        if (capsuleDelay === '24h') date.setDate(date.getDate() + 1);
        if (capsuleDelay === '7d') date.setDate(date.getDate() + 7);
        if (capsuleDelay === '30d') date.setDate(date.getDate() + 30);
        capsuleDate = date.toISOString();
    }

    onSubmit(
        content, 
        selectedPocketId === 'global' ? null : selectedPocketId, 
        selectedImage, 
        coAuthor.trim() || null,
        capsuleDate
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-pulse-base border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-fade-in-up flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <IconClose />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <IconVitality className="w-5 h-5 text-pulse-vitality" />
            Criar Nova Publicação
        </h2>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
              Onde publicar?
            </label>
            <div className="relative">
              <select
                value={selectedPocketId}
                onChange={(e) => setSelectedPocketId(e.target.value)}
                className="w-full bg-pulse-dark border border-slate-700 rounded-xl p-3 text-slate-200 appearance-none focus:border-pulse-vitality focus:outline-none"
              >
                <option value="global">🌏 Pulse Global (Público)</option>
                <optgroup label="Seus Pockets">
                  {userPockets.map(pocket => (
                    <option key={pocket.id} value={pocket.id}>{pocket.name}</option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <IconPockets className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold">
                Sua mensagem
                </label>
                <span className={`text-xs font-bold transition-colors ${isEnoughDepth ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {charsCount}/{MIN_CHARS} caracteres
                </span>
            </div>
            
            <textarea 
              ref={textareaRef}
              required={!selectedImage}
              rows={5}
              placeholder="Compartilhe algo genuíno. Evite o superficial..."
              className="w-full bg-pulse-dark border border-slate-700 rounded-xl p-3 text-white focus:border-pulse-vitality focus:outline-none resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {/* Handshake / Depth Meter */}
            <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${isEnoughDepth ? 'bg-emerald-500' : 'bg-slate-600'}`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            {!isEnoughDepth && !selectedImage && (
                <p className="text-xs text-slate-500 mt-1 italic">
                    * Escreva um pouco mais para aprofundar a conexão.
                </p>
            )}
          </div>

          {/* Advanced Features Toggle */}
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className="text-xs text-indigo-400 font-bold mt-2 mb-2 flex items-center gap-1 hover:text-indigo-300"
          >
             {showAdvanced ? '− Ocultar Opções Avançadas' : '+ Duetos e Cápsula do Tempo'}
          </button>

          {showAdvanced && (
              <div className="bg-slate-800/30 border border-slate-700 p-3 rounded-xl mb-4 space-y-4 animate-fade-in">
                  {/* Duet / Co-Author */}
                  <div>
                      <label className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-2">
                          <IconUser className="w-3 h-3" /> Co-Autor (Dueto)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Nome do parceiro" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                        value={coAuthor}
                        onChange={(e) => setCoAuthor(e.target.value)}
                      />
                  </div>

                  {/* Time Capsule */}
                  <div>
                      <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-slate-400 font-bold flex items-center gap-2">
                              <IconClock className="w-3 h-3" /> Cápsula do Tempo
                          </label>
                          <input 
                            type="checkbox" 
                            checked={timeCapsuleMode} 
                            onChange={(e) => setTimeCapsuleMode(e.target.checked)}
                            className="accent-pulse-vitality"
                          />
                      </div>
                      {timeCapsuleMode && (
                          <select 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                            value={capsuleDelay}
                            onChange={(e) => setCapsuleDelay(e.target.value)}
                          >
                              <option value="24h">Revelar em 24 horas</option>
                              <option value="7d">Revelar em 7 dias</option>
                              <option value="30d">Revelar em 30 dias</option>
                          </select>
                      )}
                  </div>
              </div>
          )}

          {/* Image Preview Area */}
          {selectedImage && (
            <div className="mb-4 relative rounded-xl overflow-hidden border border-slate-700 group mt-4">
              <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 p-2 bg-red-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remover imagem"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 mt-6">
             {/* Image Upload Button */}
             <div className="flex-shrink-0">
               <input 
                 type="file" 
                 ref={fileInputRef}
                 accept="image/*"
                 className="hidden"
                 onChange={handleImageSelect}
               />
               <button
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                 title="Anexar Imagem"
               >
                 <IconImage className="w-5 h-5" />
                 <span className="text-sm font-medium">Foto</span>
               </button>
             </div>

            <button 
              type="submit"
              disabled={(!isEnoughDepth && !selectedImage)}
              className="flex-grow bg-pulse-vitality text-pulse-dark font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <IconSend className="w-4 h-4" /> 
              {timeCapsuleMode ? 'Agendar Cápsula' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Onboarding Pact Modal ---
export const PactModal = ({ onAccept }: { onAccept: () => void }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-pulse-base border border-slate-700 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative animate-fade-in-up">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-pulse-vitality/20 rounded-full flex items-center justify-center mb-4">
            <IconHandshake className="w-8 h-8 text-pulse-vitality" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">Pacto de Não-Toxicidade</h2>
          <p className="text-slate-400 text-center mt-2">Antes de entrar, precisamos do seu compromisso.</p>
        </div>

        <div className="bg-pulse-dark p-6 rounded-xl border border-slate-800 mb-6">
          <p className="text-slate-300 italic text-center leading-relaxed">
            "{NON_TOXICITY_PACT}"
          </p>
        </div>

        <div className="flex items-center mb-8 justify-center">
          <input 
            type="checkbox" 
            id="pact-check" 
            className="w-5 h-5 accent-pulse-vitality rounded cursor-pointer"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor="pact-check" className="ml-3 text-slate-300 cursor-pointer select-none">
            Li e aceito os termos de convivência.
          </label>
        </div>

        <button 
          onClick={onAccept}
          disabled={!checked}
          className="w-full py-4 rounded-xl font-bold text-pulse-dark bg-pulse-vitality hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Entrar no PULSEOUT
        </button>
      </div>
    </div>
  );
};

// --- Pocket Application Modal ---
// Updated to support Sponsorship Logic
export const ApplicationModal = ({ 
    pocket, 
    onClose, 
    onSubmit, 
    userScore 
}: { 
    pocket: Pocket, 
    onClose: () => void, 
    onSubmit: () => void,
    userScore: number 
}) => {
  const [answers, setAnswers] = useState(['', '', '']);
  const [sponsorHandle, setSponsorHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logic: Users with score < 50 need a sponsor
  const needsSponsor = userScore < 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onSubmit();
      setIsSubmitting(false);
    }, 1500);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-pulse-base border border-slate-700 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <IconClose />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
             <IconPockets className="text-pulse-vitality w-6 h-6" />
             <h2 className="text-2xl font-bold text-white">Aplicação: {pocket.name}</h2>
          </div>
          <p className="text-slate-400">Para manter a qualidade das conexões, este Pocket exige respostas breves para entrar. Máximo 50 membros.</p>
        </div>

        {needsSponsor && (
            <div className="bg-indigo-900/30 border border-indigo-500/40 rounded-xl p-4 mb-6 flex items-start gap-3">
                <IconShield className="w-6 h-6 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-indigo-300 text-sm">Apadrinhamento Necessário</h3>
                    <p className="text-xs text-indigo-200 mt-1">
                        Seu PULSE Score ({userScore}) ainda é baixo. Para entrar em Pockets restritos, você precisa ser apadrinhado por um membro ou Árbitro existente.
                    </p>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {pocket.applicationQuestions.map((q, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-pulse-vitality mb-2">
                {idx + 1}. {q}
              </label>
              <textarea 
                required
                rows={3}
                className="w-full bg-pulse-dark border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-pulse-vitality focus:ring-1 focus:ring-pulse-vitality outline-none transition-colors"
                placeholder="Sua resposta honesta..."
                value={answers[idx]}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
              />
            </div>
          ))}

          {needsSponsor && (
              <div>
                  <label className="block text-sm font-medium text-indigo-400 mb-2 flex items-center gap-2">
                     <IconUserCheck className="w-4 h-4" /> Nome do Padrinho
                  </label>
                  <input 
                    required
                    type="text"
                    className="w-full bg-pulse-dark border border-indigo-500/50 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none transition-colors placeholder-slate-600"
                    placeholder="Nome do usuário"
                    value={sponsorHandle}
                    onChange={(e) => setSponsorHandle(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">* Se o padrinho não validar em 24h, a aplicação expira.</p>
              </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-bold text-pulse-dark bg-pulse-vitality hover:bg-yellow-400 disabled:opacity-70 transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Aplicação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Ping Modal ---
export const PingModal = ({ onClose, onSubmit, remaining }: { onClose: () => void, onSubmit: (context: string) => void, remaining: number }) => {
    const [context, setContext] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(context.trim().length > 5) onSubmit(context);
    };
  
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-pulse-base border border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
            <IconClose />
          </button>
  
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <IconPing className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Enviar PULSE Ping</h2>
            <p className="text-slate-400 text-sm mt-1">
                Conexões diretas exigem contexto. <br/>
                Você tem <span className="text-pulse-vitality font-bold">{remaining}</span> pings hoje.
            </p>
          </div>
  
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
               <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                  Tópico de Contexto (Obrigatório)
               </label>
               <input 
                  autoFocus
                  type="text"
                  required
                  placeholder="Ex: Sobre seu post de estoicismo..."
                  className="w-full bg-pulse-dark border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
               />
            </div>
            
            <button 
               type="submit"
               className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
               Enviar Ping
            </button>
          </form>
        </div>
      </div>
    );
  };
