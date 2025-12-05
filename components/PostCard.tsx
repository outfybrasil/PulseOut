import React, { useState } from 'react';
import { Post, Comment } from '../types';
import { 
    IconInsight, IconDeep, IconHandshake, IconThanks, IconUserPlus, 
    IconCheck, IconTurtle, IconMessageSquare, IconSend, IconInfo, 
    IconTrash, IconUserCheck, IconBookmark, IconMaximize, IconMinimize, 
    IconUser, IconClock, IconMic, IconMicOff, IconPlay, IconBadgeCheck,
    IconCrown
} from './Icons';

interface PostCardProps {
  post: Post;
  isCurrentUser: boolean;
  isFollowing: boolean; // New prop to check connection status
  isBookmarked?: boolean; // New prop for bookmark status
  onToggleFollow: () => void; // Handler for follow action
  onToggleBookmark?: () => void; // Handler for bookmark
  onReact: (type: 'I' | 'P' | 'A' | 'T') => void;
  onComment: (content: string, isVoice?: boolean) => void;
  onDelete?: () => void;
  onDeleteComment?: (commentId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isCurrentUser, isFollowing, isBookmarked = false, onToggleFollow, onToggleBookmark, onReact, onComment, onDelete, onDeleteComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isFocused, setIsFocused] = useState(false); // Focus Mode State
  const [isRecording, setIsRecording] = useState(false); // Voice Reply State

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
        // Simulate sending a voice note
        onComment("Mensagem de voz (0:15)", true);
        setIsRecording(false);
        return;
    }
    if (!newComment.trim()) return;
    onComment(newComment, false);
    setNewComment('');
  };

  const toggleRecording = () => {
      setIsRecording(!isRecording);
      setNewComment(''); // Clear text when switching to voice
  };

  const ReactionButton = ({ type, count, icon: Icon, label, colorClass, activeClass }: any) => {
    const isActive = post.currentUserReaction === type;
    
    return (
      <button 
        onClick={() => onReact(type)}
        className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all duration-200 border 
          ${isActive 
            ? `${activeClass} border-current bg-opacity-10` 
            : 'border-transparent hover:bg-slate-800'
          }`}
        title={label}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-current' : colorClass}`} />
        <span className={`text-xs font-medium ${isActive ? 'text-current font-bold' : 'text-slate-500 group-hover:text-white'}`}>
          {count}
        </span>
      </button>
    );
  };

  // Determine avatar ring color based on user's dominant reaction (Legacy)
  const getRingColor = () => {
    if (!post.userDominantReaction) return 'border-pulse-vitality';
    switch (post.userDominantReaction) {
      case 'I': return 'border-purple-400';
      case 'P': return 'border-blue-400';
      case 'A': return 'border-orange-400';
      case 'T': return 'border-pink-400';
      default: return 'border-pulse-vitality';
    }
  };

  // Time Capsule Check - Added safe check for empty scheduledFor
  const isLocked = post.isTimeCapsule && post.scheduledFor && new Date(post.scheduledFor) > new Date();

  return (
    <div className={`
        bg-pulse-base border transition-all duration-500 relative group/card
        ${post.isSlowMode ? 'border-cyan-500/30' : (isLocked ? 'border-indigo-500/30 border-dashed' : 'border-slate-800')} 
        ${isFocused ? 'fixed inset-0 z-50 p-8 md:p-16 overflow-y-auto m-0 rounded-none' : 'rounded-2xl p-6 mb-6 shadow-sm hover:shadow-md'}
    `}>
      
      {/* Focus Mode Close Button */}
      {isFocused && (
          <button onClick={() => setIsFocused(false)} className="fixed top-6 right-6 p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 z-50">
              <IconMinimize className="w-6 h-6" />
          </button>
      )}

      {/* Slow Mode Watermark */}
      {post.isSlowMode && !isLocked && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                <IconTurtle className="w-32 h-32 text-cyan-400" />
             </div>
          </div>
      )}

      {/* Header */}
      <div className={`flex justify-between items-start mb-4 relative z-10 ${isFocused ? 'max-w-3xl mx-auto' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className={`p-[2px] rounded-full border-2 ${getRingColor()}`}>
            <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1">
                  {post.userName}
                  {post.userIsFounder ? (
                      <IconCrown className="w-4 h-4 text-yellow-500 fill-current" />
                  ) : post.userIsVerified && (
                      <IconBadgeCheck className="w-4 h-4 text-pulse-vitality fill-current" />
                  )}
                  {post.coAuthorName && (
                      <span className="text-indigo-400 flex items-center gap-1">
                          <span className="text-slate-500">&</span> {post.coAuthorName}
                      </span>
                  )}
              </h3>
              {!isCurrentUser && (
                 <button 
                   onClick={onToggleFollow}
                   className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all text-[10px] font-bold uppercase tracking-wider ${
                       isFollowing 
                       ? 'text-emerald-400 bg-emerald-900/20 border border-emerald-500/30' 
                       : 'text-slate-500 hover:text-pulse-vitality bg-slate-800 border border-slate-700 hover:border-pulse-vitality'
                   }`}
                   title={isFollowing ? "Desconectar" : "Sintonizar nas ideias deste usuário"}
                 >
                   {isFollowing ? (
                       <>
                        <IconCheck className="w-3 h-3" />
                       </>
                   ) : (
                       <>
                        <IconUserPlus className="w-3 h-3" />
                       </>
                   )}
                 </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
               <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${post.pocketId ? 'text-pulse-vitality bg-pulse-vitality/10' : 'text-slate-400 bg-slate-800'}`}>
                 {post.pocketName || 'Global'}
               </span>
               <span className="text-xs text-slate-500">• {post.timestamp}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {/* Focus Mode Button */}
            {!isFocused && !isLocked && (
                <button onClick={() => setIsFocused(true)} className="p-2 text-slate-600 hover:text-pulse-vitality hover:bg-slate-800 rounded-lg" title="Leitura Imersiva">
                    <IconMaximize className="w-4 h-4" />
                </button>
            )}

            {isLocked && (
                <div className="flex items-center space-x-1 text-indigo-400 bg-indigo-900/20 border border-indigo-500/30 px-2 py-1 rounded-lg">
                    <IconClock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Locked</span>
                </div>
            )}

            {post.isSlowMode && (
                <div className="flex items-center space-x-1 text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 px-2 py-1 rounded-lg" title="Slow-Motion: 1 resposta a cada 30min">
                    <IconTurtle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Slow</span>
                </div>
            )}
            
            {post.depthBadge && (
                <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg" title="Selo de Profundidade">
                    <IconDeep className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Depth</span>
                </div>
            )}
            
            {/* Bookmark (Eco) Button */}
            {onToggleBookmark && (
                <button 
                  onClick={onToggleBookmark}
                  className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-pulse-vitality bg-yellow-900/10' : 'text-slate-600 hover:text-pulse-vitality hover:bg-slate-800'}`}
                  title={isBookmarked ? "Remover Eco" : "Salvar Eco"}
                >
                   <IconBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
            )}

            {/* Delete Post Button */}
            {isCurrentUser && onDelete && (
                <button 
                    onClick={() => {
                        if(window.confirm("Tem certeza que deseja excluir este post?")) onDelete();
                    }}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                    title="Excluir Post"
                >
                    <IconTrash className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>

      {isLocked ? (
          <div className="py-8 text-center relative z-10">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <IconClock className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Cápsula do Tempo</h3>
              <p className="text-slate-400 text-sm">Este conteúdo está programado para ser revelado em:</p>
              <p className="text-indigo-400 font-mono mt-2 font-bold">{new Date(post.scheduledFor || '').toLocaleDateString()}</p>
          </div>
      ) : (
        <>
            <div className={`${isFocused ? 'max-w-3xl mx-auto' : ''}`}>
                <p className={`text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap relative z-10 ${isFocused ? 'text-xl md:text-2xl leading-loose font-serif' : ''}`}>
                    {post.content}
                </p>

                {/* Attached Image */}
                {post.imageUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden border border-slate-800 relative z-10">
                    <img src={post.imageUrl} alt="Anexo do post" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                )}
            </div>

            {/* Reactions & Reply Bar */}
            <div className={`flex items-center justify-between pt-4 border-t border-slate-800/50 relative z-10 ${isFocused ? 'max-w-3xl mx-auto w-full' : ''}`}>
                
                {/* Reaction Buttons & Legend */}
                <div className="relative">
                    {/* Legend Popover */}
                    {showLegend && (
                        <div className="absolute bottom-full left-0 mb-3 z-50 w-72 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guia de Sentimentos</h4>
                            <button onClick={() => setShowLegend(false)}><span className="text-xs text-slate-500 hover:text-white">✕</span></button>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-xs text-slate-300">
                            <IconInsight className="w-4 h-4 text-purple-400 flex-shrink-0" /> 
                            <span><span className="text-purple-300 font-bold">Inspirou:</span> Clareou a mente, trouxe novas ideias.</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-slate-300">
                            <IconDeep className="w-4 h-4 text-blue-400 flex-shrink-0" /> 
                            <span><span className="text-blue-300 font-bold">Profundo:</span> Conteúdo denso, gerou reflexão.</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-slate-300">
                            <IconHandshake className="w-4 h-4 text-orange-400 flex-shrink-0" /> 
                            <span><span className="text-orange-300 font-bold">Apoio:</span> Solidariedade, "estou contigo".</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-slate-300">
                            <IconThanks className="w-4 h-4 text-pink-400 flex-shrink-0" /> 
                            <span><span className="text-pink-300 font-bold">Grato:</span> Reconhecimento, tocou o coração.</span>
                            </li>
                        </ul>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-1 items-center">
                        <ReactionButton 
                            type="I" 
                            count={post.reactions.I} 
                            icon={IconInsight} 
                            label="Inspirou" 
                            colorClass="text-purple-400"
                            activeClass="bg-purple-500/20 text-purple-400 border-purple-500"
                        />
                        <ReactionButton 
                            type="P" 
                            count={post.reactions.P} 
                            icon={IconDeep} 
                            label="Profundo" 
                            colorClass="text-blue-400" 
                            activeClass="bg-blue-500/20 text-blue-400 border-blue-500"
                        />
                        <ReactionButton 
                            type="A" 
                            count={post.reactions.A} 
                            icon={IconHandshake} 
                            label="Apoio" 
                            colorClass="text-orange-400" 
                            activeClass="bg-orange-500/20 text-orange-400 border-orange-500"
                        />
                        <ReactionButton 
                            type="T" 
                            count={post.reactions.T} 
                            icon={IconThanks} 
                            label="Grato" 
                            colorClass="text-pink-400" 
                            activeClass="bg-pink-500/20 text-pink-400 border-pink-500"
                        />
                        
                        {/* Info Button */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowLegend(!showLegend); }}
                            className={`ml-1 p-1.5 rounded-full transition-colors ${showLegend ? 'bg-slate-800 text-pulse-vitality' : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/50'}`}
                            title="Entenda as reações"
                        >
                            <IconInfo className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                
                <button 
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${showComments ? 'bg-slate-800 text-pulse-vitality' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                <IconMessageSquare className="w-4 h-4" />
                <span className="text-xs font-bold">{post.comments ? post.comments.length : 0}</span>
                </button>
            </div>

            {post.isSlowMode && (
                <div className={`mt-4 bg-cyan-950/30 border border-cyan-900/50 rounded-lg p-3 flex items-center justify-between text-xs text-cyan-300 relative z-10 ${isFocused ? 'max-w-3xl mx-auto w-full' : ''}`}>
                    <span>🐢 <b>Modo Lento Ativo:</b> Escreva com intenção. Você só pode responder novamente em 30min.</span>
                </div>
            )}

            {/* Comments Section */}
            {showComments && (
                <div className={`mt-6 pt-4 border-t border-slate-800 animate-fade-in relative z-10 ${isFocused ? 'max-w-3xl mx-auto w-full' : ''}`}>
                
                {/* Existing Comments */}
                <div className="space-y-4 mb-4">
                    {post.comments && post.comments.length > 0 ? post.comments.map(comment => {
                        return (
                        <div key={comment.id} className="flex gap-3 group/comment">
                            <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            <div className={`bg-slate-900/50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-800/50 flex-1 relative ${comment.isVoice ? 'border-pulse-vitality/30' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                                        {comment.userName}
                                        {comment.userIsFounder ? (
                                            <IconCrown className="w-3 h-3 text-yellow-500 fill-current" />
                                        ) : comment.userIsVerified && (
                                            <IconBadgeCheck className="w-3 h-3 text-pulse-vitality" />
                                        )}
                                    </span>
                                    <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                                </div>
                                {onDeleteComment && (
                                    <button 
                                        onClick={() => { if(window.confirm("Apagar comentário?")) onDeleteComment(comment.id) }}
                                        className="opacity-0 group-hover/comment:opacity-100 text-slate-600 hover:text-red-400 p-1 transition-all"
                                    >
                                        <IconTrash className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            {comment.isVoice ? (
                                <div className="flex items-center gap-3">
                                    <button className="w-8 h-8 rounded-full bg-pulse-vitality text-pulse-dark flex items-center justify-center hover:bg-yellow-400 transition-colors">
                                        <IconPlay className="w-4 h-4 ml-0.5" />
                                    </button>
                                    <div className="flex-1 h-8 flex items-center gap-1 opacity-50">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="w-1 bg-slate-400 rounded-full" style={{ height: `${Math.random() * 20 + 5}px` }}></div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">0:15</span>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-300">{comment.content}</p>
                            )}
                            </div>
                        </div>
                    )}) : (
                        <p className="text-center text-xs text-slate-500 italic py-2">Seja o primeiro a aprofundar essa conversa.</p>
                    )}
                </div>

                {/* Reply Input */}
                <form onSubmit={handleSubmitComment} className="flex gap-2 items-end">
                    <div className={`flex-1 bg-slate-900 border ${isRecording ? 'border-red-500/50 bg-red-900/10' : 'border-slate-700'} rounded-xl overflow-hidden focus-within:border-slate-500 transition-colors flex items-center pr-2`}>
                        {isRecording ? (
                            <div className="w-full p-3 text-sm text-red-300 flex items-center gap-2 animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span> Gravando resposta de voz...
                            </div>
                        ) : (
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Adicione sua perspectiva..."
                                className="w-full bg-transparent p-3 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
                                rows={1}
                                style={{ minHeight: '44px' }}
                            />
                        )}
                        <button 
                            type="button" 
                            onClick={toggleRecording}
                            className={`p-2 rounded-full transition-colors ${isRecording ? 'text-red-400 bg-red-900/20' : 'text-slate-500 hover:text-white'}`}
                            title="Gravar Voz"
                        >
                            {isRecording ? <IconMicOff className="w-4 h-4" /> : <IconMic className="w-4 h-4" />}
                        </button>
                    </div>
                    <button 
                        type="submit"
                        disabled={!isRecording && !newComment.trim()}
                        className={`p-3 rounded-xl transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-pulse-vitality text-pulse-dark hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        <IconSend className="w-4 h-4" />
                    </button>
                </form>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default PostCard;