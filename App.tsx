import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import PostCard from './components/PostCard';
import AuthScreen from './components/AuthScreen';
import { PactModal, ApplicationModal, PingModal, CreatePostModal, CreatePocketModal, SearchUsersModal } from './components/Modals';
import { OnboardingTour } from './components/OnboardingTour';
import { User, Pocket, ViewState, Post, PingMsg, ChatMessage, Comment, ShelfItem } from './types';
import { MOCK_REPORTS, MOCK_PINGS } from './constants'; 
import { 
  IconHandshake, IconEdit, IconSave, IconPockets, IconVitality, 
  IconLogOut, IconPlus, IconGlobe, IconGavel, IconCheck, IconClose,
  IconFlame, IconMic, IconPlay, IconPause, IconCamera, IconCompass, IconList,
  IconArrowRight, IconArrowLeft, IconInbox, IconPing, IconSend, IconArrowLeft as IconBack, IconTrash,
  IconUserCheck, IconBookmark, IconBook, IconFilm, IconMusic, IconBadgeCheck,
  IconCrown
} from './components/Icons';
import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [hasAcceptedPact, setHasAcceptedPact] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default to true to prevent flash
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [myPockets, setMyPockets] = useState<Pocket[]>([]);
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [feedTab, setFeedTab] = useState<'GLOBAL' | 'MY_POCKETS' | 'CONNECTIONS'>('GLOBAL'); // Added CONNECTIONS
  const [reports, setReports] = useState(MOCK_REPORTS);
  
  // Real Chat State
  const [inboxPings, setInboxPings] = useState<PingMsg[]>([]);
  const [activePingId, setActivePingId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [unreadPingCount, setUnreadPingCount] = useState(0); // For Badge
  
  // Feed Mode State (Scroll vs Compass)
  const [feedMode, setFeedMode] = useState<'SCROLL' | 'COMPASS'>('SCROLL');
  const [compassIndex, setCompassIndex] = useState(0);

  // Modal States
  const [showAppModal, setShowAppModal] = useState<Pocket | null>(null);
  const [showPingModal, setShowPingModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreatePocketModal, setShowCreatePocketModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false); // NEW
  const [searchResults, setSearchResults] = useState<User[]>([]); // NEW
  const [createPostInitialContent, setCreatePostInitialContent] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    bio: string;
    avatar: string;
    isArbiter: boolean;
    shelf: ShelfItem[];
  }>({ 
    name: '', 
    bio: '', 
    avatar: '', 
    isArbiter: false,
    shelf: []
  });
  
  // Shelf Edit Temp State
  const [newShelfItem, setNewShelfItem] = useState<{category: 'BOOK'|'SHOW'|'MUSIC', title: string, author: string}>({ category: 'BOOK', title: '', author: '' });

  const [profileTab, setProfileTab] = useState<'POSTS' | 'BOOKMARKS'>('POSTS'); // Profile Tabs for Bookmarks
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Voice Bio State (Simulated)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat Input State
  const [chatInput, setChatInput] = useState('');

  // 1. Check for active session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoadingSession(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoadingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Data when User is set
  useEffect(() => {
    let pingSubscription: any;
    let postsSubscription: any;

    if (user) {
      fetchRealPosts();
      fetchRealPockets();
      fetchRealPings();

      // Subscribe to Pings
      const pingChannel = supabase
        .channel('public:pings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pings' }, () => {
             fetchRealPings();
        })
        .subscribe();
      pingSubscription = pingChannel;

      // Subscribe to Posts (For realtime reactions/new posts)
      const postChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
           fetchRealPosts();
      })
      .subscribe();
      postsSubscription = postChannel;
    }

    return () => {
        if (pingSubscription) supabase.removeChannel(pingSubscription);
        if (postsSubscription) supabase.removeChannel(postsSubscription);
    };
  }, [user]);

  // 3. Fetch Messages when a Ping is opened
  useEffect(() => {
    let subscription: any;
    if (activePingId && user) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(activePingId);
      if (!isUUID) {
          const mockPing = MOCK_PINGS.find(p => p.id === activePingId);
          if (mockPing) setActiveMessages(mockPing.messages);
          return; 
      }
      fetchMessagesForPing(activePingId);
      const channel = supabase
        .channel(`ping-${activePingId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `ping_id=eq.${activePingId}` }, (payload) => {
            const newMsg = payload.new;
            const formattedMsg: ChatMessage = {
              id: newMsg.id,
              senderId: newMsg.sender_id === user.id ? 'me' : 'other',
              text: newMsg.content,
              timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setActiveMessages((prev) => [...prev, formattedMsg]);
        })
        .subscribe();
      subscription = channel;
    }
    return () => { if (subscription) supabase.removeChannel(subscription); };
  }, [activePingId, user]);

  useEffect(() => {
    if (activePingId && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages, activePingId]);


  // --- SUPABASE DATA FETCHING ---

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      
      // Fetch follows logic
      let followingIds: string[] = [];
      const { data: followData } = await supabase.from('follows').select('following_id').eq('follower_id', userId);
      if (followData) {
          followingIds = followData.map((f: any) => f.following_id);
      }

      // Fetch bookmarks
      let bookmarks: string[] = data.bookmarks || [];
      
      // Fetch Shelf: Robust LocalStorage Logic
      let shelf: ShelfItem[] = [];
      try {
        const storageKey = `pulseout_shelf_${userId}`;
        const localShelf = localStorage.getItem(storageKey);
        
        if (localShelf) {
            shelf = JSON.parse(localShelf);
        } else {
            // Only try DB if local is missing (and if column exists)
            shelf = (data as any).shelf || [];
        }
      } catch (e) {
        console.error("Error parsing shelf data", e);
        shelf = [];
      }

      if (data) {
        // Special logic for Founder
        const isFounder = data.handle?.toLowerCase() === '@gustavolanconi' || data.name?.toLowerCase() === 'gustavolanconi';

        const mappedUser: User = {
          id: data.id,
          name: data.name,
          handle: data.handle,
          avatar: data.avatar || `https://picsum.photos/seed/${data.id}/200`,
          bio: data.bio,
          pulseScore: data.pulse_score,
          isArbiter: data.is_arbiter,
          isVerified: isFounder ? true : (data.is_verified || false), 
          isFounder: isFounder, 
          dailyPingsRemaining: data.daily_pings_remaining,
          following: followingIds,
          bookmarks: bookmarks,
          shelf: shelf,
          reactionStats: { I: 5, P: 2, A: 8, T: 1 }, 
          // HERE: Map from DB column has_voice_bio
          hasVoiceBio: data.has_voice_bio || false 
        };
        setUser(mappedUser);
        
        // Handle Pact & Tour State
        const pact = localStorage.getItem('pulseout_pact');
        const tour = localStorage.getItem('pulseout_tour_completed');
        
        if (pact === 'true') {
            setHasAcceptedPact(true);
            setHasSeenTour(tour === 'true');
        } else {
            setHasAcceptedPact(false);
            setHasSeenTour(true); // Don't show tour before pact
        }
      }
    } catch (err) {
      console.error("Profile Error:", err);
    } finally {
      setLoadingSession(false);
    }
  };

  const fetchRealPosts = async () => {
      setLoadingData(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            user:user_id(name, avatar, handle),
            pocket:pocket_id(name),
            comments(*, user:user_id(name, avatar, handle))
        `)
        .order('created_at', { ascending: false });
      
      const { data: myReactions, error: reactionError } = await supabase
        .from('post_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', user.id);

      if (error) {
          console.error("Fetch Posts Error:", error);
          showToast("Erro ao carregar feed.");
          setLoadingData(false);
          return;
      }

      if (data) {
          const mappedPosts: Post[] = data.map((p: any) => {
             const myReaction = myReactions?.find((r: any) => r.post_id === p.id);
             
             // Founder Check for Posts
             const isFounder = p.user?.handle?.toLowerCase() === '@gustavolanconi' || p.user?.name?.toLowerCase() === 'gustavolanconi';

             return {
                 id: p.id,
                 userId: p.user_id,
                 userName: p.user?.name || 'Unknown',
                 userAvatar: p.user?.avatar || 'https://via.placeholder.com/150',
                 userIsVerified: isFounder ? true : (p.user?.is_verified || false), 
                 userIsFounder: isFounder,
                 userDominantReaction: 'A', 
                 coAuthorName: p.co_author_name,
                 content: p.content,
                 timestamp: new Date(p.created_at).toLocaleDateString(),
                 depthBadge: p.depth_badge,
                 isSlowMode: p.is_slow_mode,
                 isTimeCapsule: !!p.scheduled_for, // Check if scheduled
                 scheduledFor: p.scheduled_for,
                 reactions: p.reactions || { I: 0, P: 0, A: 0, T: 0 },
                 currentUserReaction: myReaction ? (myReaction.reaction_type as 'I' | 'P' | 'A' | 'T') : null, // Set from DB
                 pocketId: p.pocket_id,
                 pocketName: p.pocket?.name,
                 imageUrl: p.image_url,
                 comments: p.comments ? p.comments.map((c: any) => {
                     const isCommenterFounder = c.user?.handle?.toLowerCase() === '@gustavolanconi' || c.user?.name?.toLowerCase() === 'gustavolanconi';
                     return {
                        id: c.id,
                        userId: c.user_id,
                        userName: c.user?.name || 'Usuário',
                        userAvatar: c.user?.avatar || 'https://via.placeholder.com/150',
                        userIsVerified: isCommenterFounder ? true : (c.user?.is_verified || false), 
                        userIsFounder: isCommenterFounder,
                        content: c.content,
                        isVoice: c.is_voice,
                        timestamp: new Date(c.created_at).toLocaleDateString()
                     };
                 }) : []
             };
          });
          setPosts(mappedPosts);
      }
      setLoadingData(false);
  };

  const fetchRealPockets = async () => {
      // 1. Fetch all Pockets
      const { data: allPockets, error } = await supabase.from('pockets').select('*');
      if (error) { console.error("Fetch Pockets Error:", error); return; }

      // 2. Fetch my memberships
      let myJoinedIds: string[] = [];
      if (user) {
          const { data: members } = await supabase.from('pocket_members').select('pocket_id').eq('user_id', user.id);
          if (members) myJoinedIds = members.map(m => m.pocket_id);
      }

      // 3. Merge data
      if (allPockets) {
          const mappedPockets: Pocket[] = allPockets.map((p: any) => {
              const isMember = myJoinedIds.includes(p.id);
              return {
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  memberCount: 0, // In real app, perform count query
                  maxMembers: 50,
                  tags: p.tags || [],
                  isMember: isMember,
                  applicationQuestions: p.application_questions || [],
                  isCampfire: p.is_campfire,
                  campfireTime: p.campfire_time,
                  created_by: p.created_by
              };
          });
          setPockets(mappedPockets);
          setMyPockets(mappedPockets.filter(p => p.isMember));
      }
  };

  const fetchRealPings = async () => {
    if (!user) return;
    const { data: pingsData, error } = await supabase
      .from('pings')
      .select(`*, sender:sender_id(name, avatar, handle), receiver:receiver_id(name, avatar, handle)`)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && pingsData) {
      let unreadCount = 0;
      const formattedPings: PingMsg[] = pingsData.map((p: any) => {
        const isMeSender = p.sender_id === user.id;
        const otherPerson = isMeSender ? p.receiver : p.sender;
        if (!isMeSender && !p.is_read) unreadCount++;
        return {
          id: p.id,
          fromUser: otherPerson?.name || 'Usuário',
          fromAvatar: otherPerson?.avatar || 'https://via.placeholder.com/150',
          context: p.context,
          timestamp: new Date(p.created_at).toLocaleDateString(),
          isRead: p.is_read,
          messages: []
        };
      });
      setInboxPings(formattedPings);
      setUnreadPingCount(unreadCount);
    }
  };

  const fetchMessagesForPing = async (pingId: string) => {
    if (!user) return;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pingId);
    if (!isUUID) return;
    const { data, error } = await supabase.from('messages').select('*').eq('ping_id', pingId).order('created_at', { ascending: true });
    if (data) {
      const formattedMessages: ChatMessage[] = data.map((m: any) => ({
        id: m.id,
        senderId: m.sender_id === user.id ? 'me' : 'other',
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setActiveMessages(formattedMessages);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
        setSearchResults([]);
        return;
    }
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${query}%`) // Simple search by name
        .limit(10);
    
    // Also try to match handle if name returns nothing or few
    if (data) {
         // Map to User type
         const mappedUsers: User[] = data.map((p: any) => {
             const isFounder = p.handle?.toLowerCase() === '@gustavolanconi' || p.name?.toLowerCase() === 'gustavolanconi';
             return {
                id: p.id,
                name: p.name,
                handle: p.handle,
                avatar: p.avatar || `https://picsum.photos/seed/${p.id}/200`,
                bio: p.bio,
                pulseScore: p.pulse_score,
                isArbiter: p.is_arbiter,
                isVerified: isFounder ? true : (p.is_verified || false), 
                isFounder: isFounder,
                dailyPingsRemaining: 0,
                following: [],
                bookmarks: [],
                shelf: [],
                reactionStats: { I: 0, P: 0, A: 0, T: 0 }
             };
         });
         setSearchResults(mappedUsers);
    }
  };

  const markPingAsRead = async (pingId: string) => {
      const updatedPings = inboxPings.map(p => p.id === pingId ? { ...p, isRead: true } : p);
      setInboxPings(updatedPings);
      const wasUnread = inboxPings.find(p => p.id === pingId && p.isRead === false);
      if (wasUnread) setUnreadPingCount(prev => Math.max(0, prev - 1));
      
      if (user && pingId.length > 10) {
          await supabase.from('pings').update({ is_read: true }).eq('id', pingId).eq('receiver_id', user.id);
      }
  };

  const handleOpenPing = (pingId: string) => {
    setActivePingId(pingId);
    markPingAsRead(pingId);
  };

  // --- LOGIC: DELETE CONTENT ---
  const handleDeletePost = async (postId: string) => {
      if (!user) return;
      
      // Explicitly deleting using ID and USER_ID to ensure safety
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Extra safety check

      if (error) {
          console.error("Delete Post Error:", error);
          if (error.code === '23503') {
             showToast("Erro: Comentários impedem exclusão. Configure Cascade no Banco.");
          } else {
             showToast(`Erro ao excluir: ${error.message}`);
          }
      } else {
          setPosts(prev => prev.filter(p => p.id !== postId));
          showToast('Post excluído com sucesso.');
      }
  };

  const handleDeleteComment = async (commentId: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) {
          console.error("Delete Comment Error:", error);
          showToast(`Erro ao excluir: ${error.message}`);
      } else {
          // Optimistic update
          setPosts(prev => prev.map(p => ({
              ...p,
              comments: p.comments.filter(c => c.id !== commentId)
          })));
          showToast('Comentário excluído.');
      }
  };

  const handleDeletePocket = async (pocketId: string) => {
      if(!window.confirm("Atenção: Excluir este Pocket removerá todos os membros e posts associados. Continuar?")) return;
      
      const { error } = await supabase.from('pockets').delete().eq('id', pocketId);
      if (error) {
          showToast(`Erro ao excluir Pocket: ${error.message}`);
          console.error(error);
      } else {
          fetchRealPockets();
          showToast('Pocket excluído.');
          // If we are currently viewing this pocket, go home
          if (feedTab === 'MY_POCKETS') setFeedTab('GLOBAL');
      }
  };

  // --- LOGIC: PULSE SCORE & REACTIONS (UPDATED) ---
  const handleReaction = async (postId: string, type: 'I' | 'P' | 'A' | 'T', currentReactions: any, authorId: string) => {
      if (!user) return;
      
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const oldType = post.currentUserReaction;
      let newReactions = { ...currentReactions };
      let updatedUserReaction: 'I' | 'P' | 'A' | 'T' | null = type;

      // Logic for mutual exclusivity
      if (oldType === type) {
          // Toggle OFF (Remove reaction)
          newReactions[type] = Math.max(0, (newReactions[type] || 0) - 1);
          updatedUserReaction = null;
      } else {
          // New Vote or Switch
          if (oldType) {
              // Decrement old
              newReactions[oldType] = Math.max(0, (newReactions[oldType] || 0) - 1);
          }
          // Increment new
          newReactions[type] = (newReactions[type] || 0) + 1;
      }
      
      // 1. Optimistic update locally
      setPosts(posts.map(p => p.id === postId ? { 
          ...p, 
          reactions: newReactions, 
          currentUserReaction: updatedUserReaction 
      } : p));

      // 2. Update Post Aggregates
      const { error: postError } = await supabase
        .from('posts')
        .update({ reactions: newReactions })
        .eq('id', postId);

      if (postError) {
          console.error("Error updating reaction count:", postError);
          return; 
      }

      // 3. Persist User Choice (DB Sync)
      if (updatedUserReaction) {
          // Upsert: Create or Update user choice
          await supabase.from('post_reactions').upsert({
              user_id: user.id,
              post_id: postId,
              reaction_type: updatedUserReaction
          }, { onConflict: 'user_id, post_id' });
      } else {
          // Delete: User removed reaction
          await supabase.from('post_reactions').delete()
              .eq('user_id', user.id)
              .eq('post_id', postId);
      }

      // 4. Handle Scoring (Only on NEW votes, not switches for simplicity)
      if (authorId !== user.id) { 
          const getPoints = (t: string | null) => {
             if (t === 'I') return 5;
             if (t === 'P') return 2;
             if (t === 'A') return 3;
             if (t === 'T') return 1;
             return 0;
          };

          const oldPoints = getPoints(oldType);
          const newPoints = getPoints(updatedUserReaction);
          const pointDiff = newPoints - oldPoints;

          if (pointDiff !== 0) {
            const { data: authorData } = await supabase.from('profiles').select('pulse_score').eq('id', authorId).single();
            if (authorData) {
                await supabase.from('profiles').update({ pulse_score: authorData.pulse_score + pointDiff }).eq('id', authorId);
            }
          }
      }
  };

  const handleAddComment = async (postId: string, content: string, isVoice: boolean = false) => {
      if (!user) return;
      const { error } = await supabase.from('comments').insert({
          post_id: postId,
          user_id: user.id,
          content: content,
          is_voice: isVoice // NEW
      });
      if (!error) {
          fetchRealPosts(); // Refresh to see comment
      }
  };

  // --- ACTIONS ---

  const handleToggleFollow = async (targetUserId: string) => {
      if (!user) return;
      
      const isFollowing = user.following.includes(targetUserId);
      let newFollowing = [];

      if (isFollowing) {
          // Unfollow
          newFollowing = user.following.filter(id => id !== targetUserId);
          // DB Call
          await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
          showToast("Sintonia encerrada.");
      } else {
          // Follow
          newFollowing = [...user.following, targetUserId];
          // DB Call
          await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
          showToast("Sintonizado! Posts aparecerão na sua aba Conexões.");
      }

      // Optimistic Update
      setUser({ ...user, following: newFollowing });
  };

  const handleToggleBookmark = async (postId: string) => {
      if (!user) return;
      
      const isBookmarked = user.bookmarks.includes(postId);
      let newBookmarks = [];

      if (isBookmarked) {
          // Remove bookmark
          newBookmarks = user.bookmarks.filter(id => id !== postId);
          // DB Update (Simulated for MVP: Assume 'profiles' has a jsonb/array column 'bookmarks')
          await supabase.from('profiles').update({ bookmarks: newBookmarks }).eq('id', user.id);
          showToast("Eco removido.");
      } else {
          // Add bookmark
          newBookmarks = [...user.bookmarks, postId];
          await supabase.from('profiles').update({ bookmarks: newBookmarks }).eq('id', user.id);
          showToast("Eco salvo para reflexão futura.");
      }

      // Optimistic Update
      setUser({ ...user, bookmarks: newBookmarks });
  };

  // --- SHELF ACTIONS ---
  const handleAddShelfItem = () => {
      if (!newShelfItem.title || !newShelfItem.author) return;
      const newItem: ShelfItem = {
          id: Date.now().toString(),
          category: newShelfItem.category,
          title: newShelfItem.title,
          author: newShelfItem.author
      };
      setEditForm(prev => ({
          ...prev,
          shelf: [...prev.shelf, newItem]
      }));
      setNewShelfItem({ category: 'BOOK', title: '', author: '' }); // Reset
  };

  const handleRemoveShelfItem = (itemId: string) => {
      setEditForm(prev => ({
          ...prev,
          shelf: prev.shelf.filter(item => item.id !== itemId)
      }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('pulseout_pact');
    localStorage.removeItem('pulseout_tour_completed'); 
    setUser(null);
    setHasAcceptedPact(false);
    setHasSeenTour(true);
    setCurrentView('HOME');
  };

  const handleAcceptPact = () => {
    localStorage.setItem('pulseout_pact', 'true');
    setHasAcceptedPact(true);
    const tour = localStorage.getItem('pulseout_tour_completed');
    if (tour !== 'true') {
        setHasSeenTour(false); 
    }
  };

  const handleCompleteTour = () => {
      localStorage.setItem('pulseout_tour_completed', 'true');
      setHasSeenTour(true);
  };

  const handleJoinPocket = (pocket: Pocket) => {
    setShowAppModal(pocket);
  };

  const handleSubmitApplication = async () => {
    if (!showAppModal || !user) return;
    
    // Insert into pocket_members
    const { error } = await supabase.from('pocket_members').insert({
        pocket_id: showAppModal.id,
        user_id: user.id
    });

    if (error) {
        showToast("Erro ao entrar no Pocket.");
        console.error(error);
    } else {
        fetchRealPockets(); // Refresh lists
        setShowAppModal(null);
        showToast(`Bem-vindo ao Pocket "${showAppModal.name}"!`);
    }
  };

  const handlePingSubmit = async (context: string) => {
      if (user && user.dailyPingsRemaining > 0) {
          const updatedUser = {...user, dailyPingsRemaining: user.dailyPingsRemaining - 1};
          setUser(updatedUser);
          setShowPingModal(false);
          showToast(`Ping enviado! (Simulado)`);
      }
  };

  const handleSendChatMessage = async (text: string) => {
      if (!activePingId || !text.trim() || !user) return;
      if (activePingId.length < 10) {
          setActiveMessages(prev => [...prev, { id: `msg-${Date.now()}`, senderId: 'me', text, timestamp: 'Agora' }]);
          return;
      }
      const { error } = await supabase.from('messages').insert({ ping_id: activePingId, sender_id: user.id, content: text });
      if (error) showToast("Erro ao enviar mensagem.");
  };

  const handleOpenCreatePost = (initialContent: string = '') => {
    setCreatePostInitialContent(initialContent);
    setShowCreatePostModal(true);
  };

  const handleCreatePost = async (content: string, pocketId: string | null, imageUrl: string | null, coAuthor: string | null, timeCapsuleDate: string | null) => {
    if (!user) return;

    // Real DB Insert
    const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        pocket_id: pocketId,
        content: content,
        image_url: imageUrl, // Storing base64 for MVP simplicity
        is_slow_mode: false,
        depth_badge: content.length > 200, // Auto-badge for long content
        co_author_name: coAuthor, // NEW
        scheduled_for: timeCapsuleDate // NEW
    });

    if (error) {
        console.error("Create Post Error", error);
        showToast("Erro ao criar postagem.");
    } else {
        fetchRealPosts();
        setShowCreatePostModal(false);
        showToast(timeCapsuleDate ? "Cápsula do tempo criada!" : "Postagem criada com sucesso!");
        if (feedMode === 'COMPASS') setCompassIndex(0);
        if (pocketId) { setFeedTab('MY_POCKETS'); } else { setFeedTab('GLOBAL'); }
    }
  };

  const handleCreatePocket = async (data: any) => {
     if (!user) return;

     // 1. Create Pocket
     const { data: pocketData, error } = await supabase.from('pockets').insert({
         name: data.name,
         description: data.description,
         tags: data.tags,
         application_questions: data.applicationQuestions,
         created_by: user.id
     }).select().single();

     if (error || !pocketData) {
         console.error("Create Pocket Error", error);
         showToast("Erro ao criar Pocket.");
         return;
     }

     // 2. Auto-join creator
     await supabase.from('pocket_members').insert({
         pocket_id: pocketData.id,
         user_id: user.id,
         role: 'admin'
     });

     fetchRealPockets();
     setShowCreatePocketModal(false);
     showToast(`Pocket "${data.name}" criado com sucesso!`);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      const updatedUser = { 
          ...user, 
          name: editForm.name, 
          bio: editForm.bio, 
          avatar: editForm.avatar, 
          isArbiter: editForm.isArbiter,
          shelf: editForm.shelf
      };

      // 1. Save Shelf to Local Storage (Immediate Persistence)
      try {
        localStorage.setItem(`pulseout_shelf_${user.id}`, JSON.stringify(editForm.shelf));
      } catch (e) {
        console.error("Failed to save shelf locally", e);
      }

      // 2. Update UI State Immediately (Optimistic)
      setUser(updatedUser);
      setIsEditingProfile(false);
      showToast("Perfil atualizado!");

      // 3. Update Supabase (Background)
      const { error } = await supabase.from('profiles').update({
        name: editForm.name, 
        bio: editForm.bio, 
        avatar: editForm.avatar, 
        is_arbiter: editForm.isArbiter
      }).eq('id', user.id);

      if (error) {
        console.error("Error updating profile DB:", error);
      }
    }
  };
  
  const recordVoiceBio = async () => { 
      if(user) { 
          // 1. Update local state
          setUser({...user, hasVoiceBio: true}); 
          
          // 2. Update DB persistence
          await supabase.from('profiles').update({ has_voice_bio: true }).eq('id', user.id);
          
          showToast("Apresentação de voz gravada!"); 
      } 
  };

  const handleArbiterAction = (reportId: string, action: 'PENALIZE' | 'DISMISS') => {
    setReports(reports.filter(r => r.id !== reportId));
    const msg = action === 'PENALIZE' ? 'Denúncia validada. Score impactado.' : 'Denúncia absolvida.';
    showToast(msg);
  };

  const showToast = (msg: string) => {
      setShowSuccessToast(msg);
      setTimeout(() => setShowSuccessToast(null), 3000);
  };
  
  const getAvatarRingClass = () => {
    if (!user?.reactionStats) return 'border-pulse-vitality';
    const { I, P, A, T } = user.reactionStats;
    const max = Math.max(I, P, A, T);
    if (max === 0) return 'border-pulse-vitality';
    if (max === I) return 'border-purple-400';
    if (max === P) return 'border-blue-400';
    if (max === A) return 'border-orange-400';
    if (max === T) return 'border-pink-400';
    return 'border-pulse-vitality';
  };

  // --- Views (Now as render functions to prevent unnecessary remounting) ---

  const renderHomeView = () => {
    const filteredPosts = posts.filter(post => {
      if (feedTab === 'GLOBAL') return true;
      if (feedTab === 'MY_POCKETS') return post.pocketId && myPockets.some(mp => mp.id === post.pocketId);
      if (feedTab === 'CONNECTIONS') return user?.following.includes(post.userId); // Connection Logic
      return true;
    });

    const hasNext = compassIndex < filteredPosts.length - 1;
    const hasPrev = compassIndex > 0;

    return (
      <div className="animate-fade-in relative">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white">Feed Pulse</h2>
            <div className="flex gap-2">
                <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700">
                    <button onClick={() => setFeedMode('SCROLL')} className={`p-2 rounded-md ${feedMode === 'SCROLL' ? 'bg-pulse-base text-pulse-vitality shadow-sm' : 'text-slate-500'}`}><IconList className="w-5 h-5" /></button>
                    <button onClick={() => setFeedMode('COMPASS')} className={`p-2 rounded-md ${feedMode === 'COMPASS' ? 'bg-pulse-base text-pulse-vitality shadow-sm' : 'text-slate-500'}`}><IconCompass className="w-5 h-5" /></button>
                </div>
                <button onClick={() => handleOpenCreatePost()} className="bg-pulse-vitality text-pulse-dark hover:bg-yellow-400 font-bold px-4 py-2 rounded-xl flex items-center gap-2"><IconPlus className="w-5 h-5" /><span className="hidden md:inline">Nova Postagem</span></button>
            </div>
          </div>
          {/* Feed Tabs with new CONNECTIONS option */}
          <div className="flex bg-pulse-base p-1 rounded-xl inline-flex border border-slate-800 overflow-x-auto max-w-full">
            <button onClick={() => { setFeedTab('GLOBAL'); setCompassIndex(0); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${feedTab === 'GLOBAL' ? 'bg-pulse-light text-white' : 'text-slate-500'}`}><IconGlobe className="w-4 h-4" /> Global</button>
            <button onClick={() => { setFeedTab('MY_POCKETS'); setCompassIndex(0); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${feedTab === 'MY_POCKETS' ? 'bg-pulse-light text-white' : 'text-slate-500'}`}><IconPockets className="w-4 h-4" /> Pockets</button>
            <button onClick={() => { setFeedTab('CONNECTIONS'); setCompassIndex(0); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${feedTab === 'CONNECTIONS' ? 'bg-pulse-light text-white' : 'text-slate-500'}`}><IconUserCheck className="w-4 h-4" /> Conexões</button>
          </div>
        </div>

        {loadingData ? (
            <div className="text-center py-10"><IconVitality className="w-8 h-8 text-pulse-vitality animate-spin mx-auto" /></div>
        ) : filteredPosts.length > 0 ? (
          <div>
            {feedMode === 'SCROLL' ? (
                <div className="space-y-6">
                    {filteredPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            isCurrentUser={post.userId === user?.id} 
                            isFollowing={user?.following.includes(post.userId) || false}
                            isBookmarked={user?.bookmarks.includes(post.id) || false}
                            onToggleFollow={() => handleToggleFollow(post.userId)}
                            onToggleBookmark={() => handleToggleBookmark(post.id)}
                            onReact={(type) => handleReaction(post.id, type, post.reactions, post.userId)}
                            onComment={(content, isVoice) => handleAddComment(post.id, content, isVoice)}
                            onDelete={() => handleDeletePost(post.id)}
                            onDeleteComment={(commentId) => {
                                // Double check if comment belongs to user in real logic, but UI button visibility handles it mostly
                                const comment = post.comments.find(c => c.id === commentId);
                                if(comment && comment.userId === user?.id) {
                                    handleDeleteComment(commentId);
                                }
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Modo Bússola • {compassIndex + 1} de {filteredPosts.length}</span>
                        <div className="flex gap-2">
                             <button disabled={!hasPrev} onClick={() => setCompassIndex(prev => prev - 1)} className="p-3 bg-slate-800 rounded-full text-white disabled:opacity-30"><IconArrowLeft className="w-6 h-6" /></button>
                             <button disabled={!hasNext} onClick={() => setCompassIndex(prev => prev + 1)} className="p-3 bg-pulse-vitality rounded-full text-pulse-dark disabled:opacity-30"><IconArrowRight className="w-6 h-6" /></button>
                        </div>
                    </div>
                    {/* Fixed: key prop moved to correct position */}
                    <div key={compassIndex} className="animate-fade-in"> 
                         <PostCard 
                            post={filteredPosts[compassIndex]} 
                            isCurrentUser={filteredPosts[compassIndex].userId === user?.id} 
                            isFollowing={user?.following.includes(filteredPosts[compassIndex].userId) || false}
                            isBookmarked={user?.bookmarks.includes(filteredPosts[compassIndex].id) || false}
                            onToggleFollow={() => handleToggleFollow(filteredPosts[compassIndex].userId)}
                            onToggleBookmark={() => handleToggleBookmark(filteredPosts[compassIndex].id)}
                            onReact={(type) => handleReaction(filteredPosts[compassIndex].id, type, filteredPosts[compassIndex].reactions, filteredPosts[compassIndex].userId)}
                            onComment={(content, isVoice) => handleAddComment(filteredPosts[compassIndex].id, content, isVoice)}
                            onDelete={() => handleDeletePost(filteredPosts[compassIndex].id)}
                            onDeleteComment={(commentId) => handleDeleteComment(commentId)}
                         />
                    </div>
                </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">{feedTab === 'GLOBAL' ? <IconGlobe className="text-slate-500" /> : (feedTab === 'CONNECTIONS' ? <IconUserCheck className="text-slate-500" /> : <IconPockets className="text-slate-500" />)}</div>
             <p className="text-slate-400 font-medium">
                 {feedTab === 'CONNECTIONS' 
                    ? "Você ainda não sintonizou em ninguém. Encontre vozes que ressoam com você no feed Global." 
                    : "Nenhum post encontrado."}
             </p>
          </div>
        )}
      </div>
    );
  };

  const renderInboxView = () => {
    const activePing = inboxPings.find(p => p.id === activePingId);
    const handleSend = (e: React.FormEvent) => { e.preventDefault(); if(chatInput.trim()) { handleSendChatMessage(chatInput); setChatInput(''); } };

    if (activePing) {
        return (
            <div className="animate-fade-in flex flex-col h-[calc(100vh-100px)] md:h-[600px] bg-pulse-base border border-slate-800 rounded-2xl overflow-hidden relative">
                <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex items-center gap-3 backdrop-blur-md sticky top-0 z-10">
                    <button onClick={() => { setActivePingId(null); setActiveMessages([]); }} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"><IconBack className="w-5 h-5" /></button>
                    <img src={activePing.fromAvatar} alt={activePing.fromUser} className="w-10 h-10 rounded-full" />
                    <div><h3 className="font-bold text-white text-sm">{activePing.fromUser}</h3><div className="flex items-center gap-1.5 text-xs text-indigo-400"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span><span>Contexto: {activePing.context}</span></div></div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pulse-dark/50">
                    {activeMessages.length > 0 ? (activeMessages.map(msg => (<div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${msg.senderId === 'me' ? 'bg-pulse-vitality text-pulse-dark rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}><p>{msg.text}</p><div className={`text-[10px] mt-1 text-right ${msg.senderId === 'me' ? 'text-yellow-900/60' : 'text-slate-500'}`}>{msg.timestamp}</div></div></div>))) : (<div className="text-center text-slate-500 text-sm mt-10">Inicie a conversa sobre: "{activePing.context}"</div>)}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Digite..." className="flex-1 bg-pulse-dark border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pulse-vitality" /><button type="submit" disabled={!chatInput.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl"><IconSend className="w-5 h-5" /></button></form>
            </div>
        );
    }
    return (
      <div className="animate-fade-in">
          <div className="mb-6 bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6"><div className="flex items-start gap-4"><div className="bg-indigo-500/20 p-3 rounded-full"><IconInbox className="w-6 h-6 text-indigo-400" /></div><div><h2 className="text-2xl font-bold text-white mb-1">Caixa de Entrada</h2><p className="text-slate-300 text-sm">Pings custam energia. Valorize a intenção.</p></div></div></div>
          <div className="space-y-4">{inboxPings.length > 0 ? inboxPings.map(ping => (<div key={ping.id} onClick={() => handleOpenPing(ping.id)} className={`bg-pulse-base border ${ping.isRead ? 'border-slate-800' : 'border-indigo-500/50'} rounded-xl p-4 flex gap-4 hover:bg-slate-800/50 cursor-pointer relative`}><img src={ping.fromAvatar} alt={ping.fromUser} className="w-12 h-12 rounded-full object-cover" /><div className="flex-1"><div className="flex justify-between items-start mb-1"><span className={`font-bold ${ping.isRead ? 'text-slate-300' : 'text-white'}`}>{ping.fromUser}</span><span className="text-xs text-slate-500">{ping.timestamp}</span></div><div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 mb-2"><span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block mb-1">Contexto:</span><p className="text-sm text-slate-300 italic">"{ping.context}"</p></div><div className="flex justify-end opacity-70"><span className="text-xs font-bold text-pulse-vitality flex items-center gap-1"><IconPing className="w-3 h-3" /> Abrir</span></div></div>{!ping.isRead && (<div className="absolute top-4 right-4 w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-indigo"></div>)}</div>)) : (<div className="text-center py-12 border border-dashed border-slate-700 rounded-xl"><IconInbox className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Caixa de entrada vazia.</p></div>)}</div>
      </div>
    );
  };

  const renderPocketsView = () => (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div><h2 className="text-3xl font-bold text-white mb-2">Pockets</h2><p className="text-slate-400">Micro-comunidades limitadas.</p></div>
        <button onClick={() => setShowCreatePocketModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2"><IconPlus className="w-5 h-5" /> Criar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{pockets.map(pocket => (
        <div key={pocket.id} className={`bg-pulse-base border rounded-2xl p-6 relative overflow-hidden group ${pocket.isCampfire ? 'border-orange-500/30' : 'border-slate-700'}`}>
            {pocket.isCampfire && (<div className="absolute top-0 right-0 p-3"><IconFlame className="text-orange-500 w-5 h-5" /></div>)}
            
            {/* Delete Pocket Button */}
            {user && pocket.created_by === user.id && (
                <button 
                    onClick={() => handleDeletePocket(pocket.id)}
                    className="absolute top-3 right-3 p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                    title="Excluir Pocket"
                >
                    <IconTrash className="w-4 h-4" />
                </button>
            )}

            <div className="flex justify-between items-start mb-4 pr-10"><div><h3 className="text-xl font-bold text-white">{pocket.name}</h3></div><span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md">{pocket.memberCount || 0}/50</span></div><p className="text-slate-300 text-sm mb-4">{pocket.description}</p><div className="flex flex-wrap gap-2 mb-6">{pocket.tags.map(tag => (<span key={tag} className="text-xs text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded">#{tag}</span>))}</div>{pocket.isMember ? (<button disabled className="w-full py-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><IconHandshake className="w-4 h-4" /> Membro</button>) : (<button onClick={() => handleJoinPocket(pocket)} className="w-full py-2 bg-slate-100 hover:bg-white text-pulse-dark rounded-lg text-sm font-bold">Aplicar</button>)}
        </div>
      ))}</div>
    </div>
  );

  const renderProfileView = () => (
      <div className="animate-fade-in">
          <div className="bg-pulse-base border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 relative">
             <div className="absolute top-4 right-4 flex gap-2 z-10">
                {isEditingProfile ? (<button onClick={handleSaveProfile} className="flex items-center gap-2 bg-pulse-vitality text-pulse-dark px-4 py-2 rounded-xl font-bold text-sm"><IconSave className="w-4 h-4" /> Salvar</button>) : (<button onClick={() => { 
                    setEditForm({ 
                        name: user?.name || '', 
                        bio: user?.bio || '', 
                        avatar: user?.avatar || '', 
                        isArbiter: user?.isArbiter || false,
                        shelf: user?.shelf || []
                    }); 
                    setIsEditingProfile(true); 
                }} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl font-medium text-sm"><IconEdit className="w-4 h-4" /> Editar</button>)}
                <button onClick={handleLogout} className="p-2 bg-red-900/20 text-red-400 rounded-xl hover:bg-red-900/40"><IconLogOut className="w-5 h-5" /></button>
             </div>
             <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mt-4 md:mt-0">
                <div className={`p-1 rounded-full border-4 ${getAvatarRingClass()} relative group overflow-hidden ${isEditingProfile ? 'cursor-pointer' : ''}`} onClick={() => isEditingProfile && avatarInputRef.current?.click()}><img src={isEditingProfile ? editForm.avatar : user?.avatar} alt={user?.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover" />{isEditingProfile && (<div className="absolute inset-0 bg-black/60 flex items-center justify-center"><IconCamera className="w-8 h-8 text-white" /></div>)}<input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} /></div>
                
                <div className="text-center md:text-left flex-1 w-full">{isEditingProfile ? (
                    <div className="space-y-4 max-w-lg mx-auto md:mx-0">
                        <div><label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Nome</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-pulse-dark border border-slate-700 p-3 rounded-xl text-white" /></div>
                        <div><label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Bio</label><textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-pulse-dark border border-slate-700 p-3 rounded-xl text-slate-300 text-sm resize-none" rows={3} /></div>
                        
                        {/* Cultural Shelf Edit */}
                        <div className="pt-4 border-t border-slate-700">
                            <h4 className="text-pulse-vitality text-sm font-bold mb-3 flex items-center gap-2"><IconBook className="w-4 h-4" /> Minhas Referências</h4>
                            <div className="space-y-4">
                                {editForm.shelf.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-slate-900 border border-slate-700 p-3 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-800 p-2 rounded-full text-slate-400">
                                                {item.category === 'BOOK' && <IconBook className="w-4 h-4" />}
                                                {item.category === 'SHOW' && <IconFilm className="w-4 h-4" />}
                                                {item.category === 'MUSIC' && <IconMusic className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{item.title}</p>
                                                <p className="text-xs text-slate-500">{item.author}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveShelfItem(item.id)} className="text-red-400 hover:text-red-300"><IconTrash className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                
                                {editForm.shelf.length < 3 && (
                                    <div className="flex gap-2 items-end bg-slate-900/50 p-3 rounded-xl border border-slate-800 border-dashed">
                                        <div className="w-24">
                                            <label className="text-[10px] text-slate-500 block mb-1">Tipo</label>
                                            <select 
                                                value={newShelfItem.category}
                                                onChange={(e) => setNewShelfItem({...newShelfItem, category: e.target.value as any})}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                            >
                                                <option value="BOOK">Livro</option>
                                                <option value="SHOW">Filme/Série</option>
                                                <option value="MUSIC">Música</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-500 block mb-1">Título</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Matrix"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                                value={newShelfItem.title}
                                                onChange={(e) => setNewShelfItem({...newShelfItem, title: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-500 block mb-1">Autor/Diretor</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Wachowskis"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                                value={newShelfItem.author}
                                                onChange={(e) => setNewShelfItem({...newShelfItem, author: e.target.value})}
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleAddShelfItem}
                                            disabled={!newShelfItem.title || !newShelfItem.author}
                                            className="bg-pulse-vitality text-pulse-dark p-2 rounded-lg disabled:opacity-50"
                                        >
                                            <IconPlus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2"><button onClick={recordVoiceBio} type="button" className="w-full border border-dashed border-slate-600 hover:border-indigo-400 text-slate-400 p-3 rounded-xl flex items-center justify-center gap-2"><IconMic className="w-4 h-4" /> <span className="text-sm font-bold">Gravar Voz</span></button></div>
                    </div>
                ) : (<><h2 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                    {user?.name}
                    {user?.isFounder ? (
                        <IconCrown className="w-6 h-6 text-yellow-500 fill-current" />
                    ) : user?.isVerified && (
                        <IconBadgeCheck className="w-6 h-6 text-pulse-vitality fill-current" />
                    )}
                </h2>
                <p className="text-pulse-vitality font-medium text-sm mb-4">{user?.handle}</p><p className="text-slate-300 max-w-lg mx-auto md:mx-0 leading-relaxed">{user?.bio || "Sem bio."}</p>
                <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                    <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <IconUserCheck className="w-3 h-3" /> Sintonizados: <span className="text-white ml-1">{user?.following?.length || 0}</span>
                    </div>
                </div>
                </>)}</div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center"><div className="text-2xl font-bold text-pulse-vitality">{user?.pulseScore}</div><div className="text-xs text-slate-500 uppercase font-semibold">PULSE Score</div></div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center"><div className="text-2xl font-bold text-indigo-400">{user?.isArbiter ? 'Sim' : 'Não'}</div><div className="text-xs text-slate-500 uppercase font-semibold">Árbitro</div></div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center"><div className="text-2xl font-bold text-emerald-400">{myPockets.length}</div><div className="text-xs text-slate-500 uppercase font-semibold">Pockets</div></div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center"><div className="text-2xl font-bold text-slate-200">{posts.filter(p => p.userId === user?.id).length}</div><div className="text-xs text-slate-500 uppercase font-semibold">Posts</div></div>
          </div>
          
          {/* Cultural Shelf Display (View Mode) */}
          {!isEditingProfile && user?.shelf && user.shelf.length > 0 && (
              <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><IconBook className="w-5 h-5 text-pulse-vitality" /> Estante de Referências</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {user.shelf.map(item => (
                          <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-slate-600 transition-colors">
                              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                                  {item.category === 'BOOK' && <IconBook className="w-6 h-6" />}
                                  {item.category === 'SHOW' && <IconFilm className="w-6 h-6" />}
                                  {item.category === 'MUSIC' && <IconMusic className="w-6 h-6" />}
                              </div>
                              <div>
                                  <p className="font-bold text-white text-sm line-clamp-1">{item.title}</p>
                                  <p className="text-xs text-slate-500 line-clamp-1">{item.author}</p>
                                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1 block">{item.category === 'BOOK' ? 'Livro' : item.category === 'SHOW' ? 'Filme/Série' : 'Música'}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Profile Tabs */}
          {!isEditingProfile && (
             <div className="flex justify-center mb-6 border-b border-slate-800">
                <button 
                  onClick={() => setProfileTab('POSTS')}
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${profileTab === 'POSTS' ? 'border-pulse-vitality text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    Meus Posts
                </button>
                <button 
                  onClick={() => setProfileTab('BOOKMARKS')}
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${profileTab === 'BOOKMARKS' ? 'border-pulse-vitality text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    Ecos Guardados
                </button>
             </div>
          )}

          {/* Tab Content */}
          {!isEditingProfile && (
            <div className="animate-fade-in">

                {profileTab === 'POSTS' && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><IconPockets className="w-5 h-5 text-indigo-400" /> Meus Pockets</h3>
                        {myPockets.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">{myPockets.map(pocket => (<div key={pocket.id} className="bg-pulse-base border border-slate-800 p-4 rounded-xl flex justify-between items-center"><div><h4 className="font-bold text-slate-200 flex items-center gap-2">{pocket.name}{pocket.isCampfire && <IconFlame className="w-3 h-3 text-orange-500" />}</h4></div><span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded">Membro</span></div>))}</div>) : (<div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-xl p-8 text-center mb-8"><p className="text-slate-400">Nenhum pocket ainda.</p></div>)}
                        
                        <h3 className="text-lg font-bold text-white mb-4">Histórico de Publicações</h3>
                        {posts.filter(p => p.userId === user?.id).length > 0 ? (
                           posts.filter(p => p.userId === user?.id).map(post => (
                            <PostCard 
                                key={post.id} 
                                post={post} 
                                isCurrentUser={true} 
                                isFollowing={false}
                                isBookmarked={user?.bookmarks.includes(post.id)}
                                onToggleFollow={() => handleToggleFollow(post.userId)}
                                onToggleBookmark={() => handleToggleBookmark(post.id)}
                                onReact={(type) => handleReaction(post.id, type, post.reactions, post.userId)}
                                onComment={(content, isVoice) => handleAddComment(post.id, content, isVoice)}
                                onDelete={() => handleDeletePost(post.id)}
                                onDeleteComment={(commentId) => handleDeleteComment(commentId)}
                            />
                           ))
                        ) : (
                            <div className="text-center py-8 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                                <p className="text-slate-500">Você ainda não publicou nada.</p>
                            </div>
                        )}
                    </div>
                )}

                {profileTab === 'BOOKMARKS' && (
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-pulse-vitality">
                           <IconBookmark className="w-5 h-5" />
                           <h3 className="text-lg font-bold text-white">Ecos Guardados</h3>
                        </div>
                        {user?.bookmarks.length > 0 ? (
                            posts.filter(p => user.bookmarks.includes(p.id)).map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    isCurrentUser={post.userId === user.id} 
                                    isFollowing={user.following.includes(post.userId)}
                                    isBookmarked={true}
                                    onToggleFollow={() => handleToggleFollow(post.userId)}
                                    onToggleBookmark={() => handleToggleBookmark(post.id)}
                                    onReact={(type) => handleReaction(post.id, type, post.reactions, post.userId)}
                                    onComment={(content, isVoice) => handleAddComment(post.id, content, isVoice)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                                <IconBookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">Você ainda não salvou nenhum Eco.</p>
                                <p className="text-slate-600 text-sm mt-1">Salve posts que valem a pena reler.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
          )}
      </div>
  );

  const renderArbiterView = () => (
    <div className="animate-fade-in">
       <div className="flex items-center gap-3 mb-6"><div className="bg-red-900/30 p-3 rounded-full"><IconGavel className="w-8 h-8 text-red-400" /></div><div><h2 className="text-3xl font-bold text-white">Zona dos Árbitros</h2></div></div>
       {reports.length > 0 ? (<div className="grid gap-4">{reports.map(report => (<div key={report.id} className="bg-pulse-base border border-slate-800 rounded-xl p-6"><div className="flex justify-between items-start mb-4"><span className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded-md font-bold uppercase">{report.reason}</span><span className="text-slate-500 text-xs">Autor: {report.author}</span></div><p className="text-slate-200 italic mb-6">"{report.content}"</p><div className="flex gap-4"><button onClick={() => handleArbiterAction(report.id, 'DISMISS')} className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-400 font-bold flex items-center justify-center gap-2"><IconClose className="w-4 h-4" /> Absolver</button><button onClick={() => handleArbiterAction(report.id, 'PENALIZE')} className="flex-1 py-3 rounded-lg bg-red-600/20 border border-red-600/50 text-red-400 font-bold flex items-center justify-center gap-2"><IconGavel className="w-4 h-4" /> Penalizar</button></div></div>))}</div>) : (<div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700"><IconCheck className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">Tudo Limpo!</h3></div>)}
    </div>
  );

  // Views Mapping
  if (loadingSession) return <div className="min-h-screen bg-pulse-dark flex items-center justify-center"><IconVitality className="w-10 h-10 text-pulse-vitality animate-bounce" /></div>;
  if (!user) return <AuthScreen onSuccess={() => {}} />;

  return (
    <>
      {!hasAcceptedPact && <PactModal onAccept={handleAcceptPact} />}
      {!hasSeenTour && hasAcceptedPact && <OnboardingTour onComplete={handleCompleteTour} />}

      {showAppModal && (<ApplicationModal pocket={showAppModal} onClose={() => setShowAppModal(null)} onSubmit={handleSubmitApplication} userScore={user.pulseScore} />)}
      {showCreatePocketModal && (<CreatePocketModal onClose={() => setShowCreatePocketModal(false)} onSubmit={handleCreatePocket} />)}
      {showPingModal && (<PingModal remaining={user.dailyPingsRemaining} onClose={() => setShowPingModal(false)} onSubmit={handlePingSubmit} />)}
      {showCreatePostModal && (<CreatePostModal userPockets={myPockets} onClose={() => { setShowCreatePostModal(false); setCreatePostInitialContent(''); }} onSubmit={handleCreatePost} initialContent={createPostInitialContent} />)}
      {showSearchModal && user && (<SearchUsersModal onClose={() => setShowSearchModal(false)} onSearch={handleSearchUsers} results={searchResults} onToggleFollow={handleToggleFollow} currentUser={user} />)}
      {showSuccessToast && (<div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-fade-in-up"><IconHandshake className="w-5 h-5" />{showSuccessToast}</div>)}
      <Layout 
        user={user} 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onOpenPing={() => setShowPingModal(true)} 
        onTriggerPost={handleOpenCreatePost} 
        onOpenSearch={() => setShowSearchModal(true)}
        unreadPingCount={unreadPingCount}
      >
        {currentView === 'HOME' && renderHomeView()}
        {currentView === 'INBOX' && renderInboxView()}
        {currentView === 'POCKETS' && renderPocketsView()}
        {currentView === 'PROFILE' && renderProfileView()}
        {currentView === 'ARBITER' && renderArbiterView()}
      </Layout>
    </>
  );
}
export default App;