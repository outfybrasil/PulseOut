import React, { useState, useEffect } from 'react';
import { User, ViewState } from '../types';
import { getDailyPrompt } from '../constants';
import { 
  IconPockets, 
  IconArbiter, 
  IconVitality,
  IconPing,
  IconQuote,
  IconGavel,
  IconInbox,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconUserCheck,
  IconSearch,
  IconBadgeCheck,
  IconCrown
} from './Icons';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenPing: () => void;
  onTriggerPost: (prompt: string) => void;
  onOpenSearch: () => void; // New prop
  unreadPingCount?: number; 
}

const Layout: React.FC<LayoutProps> = ({ user, children, currentView, onNavigate, onOpenPing, onTriggerPost, onOpenSearch, unreadPingCount = 0 }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dailyPrompt, setDailyPrompt] = useState('');

  useEffect(() => {
    // Use shared logic to ensure consistent prompt across app
    setDailyPrompt(getDailyPrompt());
  }, []);

  const NavItem = ({ view, label, icon: Icon }: { view: ViewState, label: string, icon: any }) => (
    <button
      onClick={() => {
        onNavigate(view);
      }}
      className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 relative group ${
        currentView === view 
          ? 'bg-pulse-vitality text-pulse-dark font-bold shadow-lg shadow-yellow-500/20' 
          : 'text-slate-400 hover:bg-pulse-light hover:text-slate-100'
      } ${isSidebarCollapsed ? 'justify-center' : 'justify-start space-x-3'}`}
      title={isSidebarCollapsed ? label : ''}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      
      {!isSidebarCollapsed && (
          <span className="truncate">{label}</span>
      )}
      
      {/* Unread Badge (Desktop) */}
      {view === 'INBOX' && unreadPingCount > 0 && (
         <div className={`absolute ${isSidebarCollapsed ? '-top-1 -right-1' : 'right-3 top-1/2 -translate-y-1/2'} flex items-center justify-center rounded-full ${currentView === 'INBOX' ? 'bg-pulse-dark text-pulse-vitality' : 'bg-pulse-vitality text-pulse-dark'} min-w-[20px] h-5 px-1.5 z-10 shadow-sm`}>
            <span className="text-[10px] font-extrabold">{unreadPingCount}</span>
         </div>
      )}
    </button>
  );

  // Mobile Bottom Nav Item
  const MobileNavItem = ({ view, icon: Icon, hasBadge, badgeCount }: { view: ViewState, icon: any, hasBadge?: boolean, badgeCount?: number }) => {
      const isActive = currentView === view;
      return (
        <button 
            onClick={() => onNavigate(view)}
            className={`flex flex-col items-center justify-center w-full py-1 relative ${isActive ? 'text-pulse-vitality' : 'text-slate-500'}`}
        >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-pulse-vitality/10' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            </div>
            {hasBadge && badgeCount && badgeCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-pulse-vitality rounded-full ring-2 ring-pulse-base"></span>
            )}
        </button>
      );
  };

  // --- Legacy Ring Logic ---
  const getAvatarRingClass = () => {
    if (!user.reactionStats) return 'border-pulse-vitality';
    
    const { I, P, A, T } = user.reactionStats;
    const max = Math.max(I, P, A, T);
    
    if (max === 0) return 'border-pulse-vitality';
    if (max === I) return 'border-purple-400'; // Insight
    if (max === P) return 'border-blue-400';   // Practical
    if (max === A) return 'border-orange-400'; // Amplifier
    if (max === T) return 'border-pink-400';   // Thanks
    
    return 'border-pulse-vitality';
  };

  const ringClass = getAvatarRingClass();

  return (
    <div className="min-h-screen bg-pulse-dark flex flex-col md:flex-row">
      
      {/* --- MOBILE LAYOUT --- */}

      {/* Mobile Top Header: Clean & Simple */}
      <header className="md:hidden bg-pulse-base/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-30 w-full shrink-0">
        <div className="flex items-center space-x-2" onClick={() => onNavigate('HOME')}>
          <div className="w-8 h-8 bg-pulse-vitality rounded-full flex items-center justify-center shadow-sm">
             <IconVitality className="text-pulse-dark w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">PULSE<span className="text-pulse-vitality">OUT</span></h1>
        </div>
        
        {/* User Score Pill & Search */}
        <div className="flex items-center gap-3">
             <button onClick={onOpenSearch} className="p-2 text-slate-400 hover:text-white">
                 <IconSearch className="w-5 h-5" />
             </button>

             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score</span>
                 <span className={`text-xs font-bold ${user.pulseScore > 100 ? 'text-emerald-400' : 'text-white'}`}>{user.pulseScore}</span>
             </div>
             <div className={`w-8 h-8 rounded-full border-2 ${ringClass} p-[1px] relative`}>
                 <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                 {user.isFounder ? (
                     <div className="absolute -bottom-1 -right-1 bg-pulse-base rounded-full p-0.5">
                         <IconCrown className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                     </div>
                 ) : user.isVerified && (
                     <div className="absolute -bottom-1 -right-1 bg-pulse-base rounded-full p-0.5">
                         <IconBadgeCheck className="w-3.5 h-3.5 text-pulse-vitality fill-current" />
                     </div>
                 )}
             </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-pulse-base border-t border-slate-800 z-50 px-2 pb-safe-area pt-2 flex justify-between items-center h-16 safe-area-pb">
        <MobileNavItem view="HOME" icon={IconVitality} />
        <MobileNavItem view="POCKETS" icon={IconPockets} />
        
        {/* Central Create Button (Floating Look) */}
        <div className="relative -top-5">
            <button 
                onClick={() => onTriggerPost('')}
                className="w-14 h-14 bg-pulse-vitality rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 border-4 border-pulse-base active:scale-95 transition-transform"
            >
                <IconPlus className="w-7 h-7 text-pulse-dark" />
            </button>
        </div>

        <MobileNavItem view="INBOX" icon={IconInbox} hasBadge={true} badgeCount={unreadPingCount} />
        <MobileNavItem view="PROFILE" icon={IconUserCheck} />
      </nav>


      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
          className={`hidden md:flex flex-col border-r border-slate-800 h-screen sticky top-0 z-20 overflow-x-hidden bg-pulse-base transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
      >
          {/* Header & Toggle */}
          <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
             {!isSidebarCollapsed && (
                <div className="flex items-center space-x-2 cursor-pointer transition-opacity duration-300" onClick={() => onNavigate('HOME')}>
                    <div className="w-8 h-8 bg-pulse-vitality rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 flex-shrink-0">
                    <IconVitality className="text-pulse-dark w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">PULSE<span className="text-pulse-vitality">OUT</span></h1>
                </div>
             )}
             {isSidebarCollapsed && (
                 <div className="w-8 h-8 bg-pulse-vitality rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 flex-shrink-0 cursor-pointer" onClick={() => setIsSidebarCollapsed(false)}>
                    <IconVitality className="text-pulse-dark w-5 h-5" />
                 </div>
             )}
             
             {/* Collapse Button */}
             <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 ${isSidebarCollapsed ? 'hidden' : 'block'}`}
                title="Recolher Menu"
             >
                <IconChevronLeft className="w-5 h-5" />
             </button>
          </div>
          
          {/* Toggle Button when collapsed (Centered) */}
          {isSidebarCollapsed && (
              <div className="flex justify-center mb-6">
                <button 
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg"
                    title="Expandir Menu"
                >
                    <IconChevronRight className="w-5 h-5" />
                </button>
              </div>
          )}

          <nav className="space-y-2 px-3 mb-8 flex-1">
            <NavItem view="HOME" label="Feed Principal" icon={IconVitality} />
            
            {/* Search Button */}
            <button
                onClick={onOpenSearch}
                className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 relative group text-slate-400 hover:bg-pulse-light hover:text-slate-100 ${isSidebarCollapsed ? 'justify-center' : 'justify-start space-x-3'}`}
                title="Buscar Pessoas"
            >
                <IconSearch className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Buscar Pessoas</span>}
            </button>

            <NavItem view="INBOX" label="Inbox (Pings)" icon={IconInbox} />
            <NavItem view="POCKETS" label="Meus Pockets" icon={IconPockets} />
            <NavItem view="PROFILE" label="Meu Perfil" icon={IconArbiter} />
            {user.isArbiter && (
               <div className={`pt-2 mt-2 border-t border-slate-800 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
                  <NavItem view="ARBITER" label="Zona dos Árbitros" icon={IconGavel} />
               </div>
            )}
          </nav>

          {/* Daily Reflection Widget (Hides when collapsed) */}
          <div className={`px-4 mb-6 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-pulse-vitality">
                <IconQuote className="w-4 h-4" />
                <span className="text-xs font-bold uppercase whitespace-nowrap">Reflexão (24h)</span>
                </div>
                <p className="text-sm text-slate-300 italic mb-3 line-clamp-3">"{dailyPrompt}"</p>
                <button 
                onClick={() => onTriggerPost(dailyPrompt)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-xs text-white font-bold rounded-lg transition-colors"
                >
                Responder
                </button>
            </div>
          </div>

          {/* User Stats Widget (Shrinks when collapsed) */}
          <div className="mt-auto pt-4 pb-6 px-3 border-t border-slate-800">
            {isSidebarCollapsed ? (
                <div className="flex flex-col items-center gap-3">
                    <div className={`p-[2px] rounded-full border-2 ${ringClass} relative`}>
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        {user.isFounder ? (
                            <div className="absolute -bottom-1 -right-1 bg-pulse-base rounded-full p-0.5">
                                <IconCrown className="w-3 h-3 text-yellow-500 fill-current" />
                            </div>
                        ) : user.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-pulse-base rounded-full p-0.5">
                                <IconBadgeCheck className="w-3 h-3 text-pulse-vitality fill-current" />
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onOpenPing}
                        disabled={user.dailyPingsRemaining === 0}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white disabled:opacity-50"
                        title={`Pings: ${user.dailyPingsRemaining}`}
                    >
                        <IconPing className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="bg-pulse-light rounded-xl p-4 border border-slate-700">
                <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-[2px] rounded-full border-2 ${ringClass}`}>
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    </div>
                    <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate flex items-center gap-1">
                        {user.name}
                        {user.isFounder ? (
                            <IconCrown className="w-3 h-3 text-yellow-500 fill-current" />
                        ) : user.isVerified && (
                            <IconBadgeCheck className="w-3 h-3 text-pulse-vitality fill-current" />
                        )}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.handle}</p>
                    </div>
                </div>
                
                {/* Score Progress Bar */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400 uppercase font-bold">PULSE Score</span>
                    <span className="text-xs text-pulse-vitality font-bold">{user.pulseScore}/150</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-pulse-vitality to-yellow-600 h-1.5 rounded-full" 
                        style={{ width: `${(user.pulseScore / 150) * 100}%` }}
                    ></div>
                    </div>
                </div>

                <button 
                    onClick={onOpenPing}
                    disabled={user.dailyPingsRemaining === 0}
                    className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <IconPing className="w-3 h-3" />
                    <span>PINGS: {user.dailyPingsRemaining}/5</span>
                </button>
                </div>
            )}
          </div>
      </aside>

      {/* Main Content Area */}
      {/* Added bottom padding for mobile to account for Bottom Nav */}
      <main className="flex-1 min-w-0 transition-all duration-300 pb-20 md:pb-0">
          <div className="max-w-2xl mx-auto p-4 md:p-8">
            {children}
          </div>
      </main>
    </div>
  );
};

export default Layout;