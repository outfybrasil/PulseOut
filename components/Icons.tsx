import React from 'react';
import { 
  Users, 
  MessageCircle, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  HeartHandshake, 
  Lightbulb, 
  Wrench, 
  Megaphone, 
  Heart,
  Menu,
  X,
  Send,
  Edit2,
  LogOut,
  Camera,
  Check,
  Save,
  Plus,
  Globe,
  UserPlus,
  Image,
  Trash2,
  Gavel,
  Quote,
  Lock,
  Mail,
  Flame,
  Mic,
  Play,
  PauseCircle,
  Compass,
  LayoutList,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Shield,
  MessageSquare,
  Inbox,
  Info,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sun,
  AlertTriangle,
  MessageCircleQuestion,
  Search,
  Book,
  Film,
  Music,
  Maximize2,
  Minimize2,
  Clock,
  MicOff,
  User,
  BadgeCheck,
  Crown
} from 'lucide-react';

export const IconPockets = ({ className }: { className?: string }) => <Users className={className} />;
export const IconPing = ({ className }: { className?: string }) => <MessageCircle className={className} />;
export const IconArbiter = ({ className }: { className?: string }) => <ShieldCheck className={className} />;
export const IconVitality = ({ className }: { className?: string }) => <Zap className={className} />;
export const IconDeep = ({ className }: { className?: string }) => <BookOpen className={className} />;
export const IconHandshake = ({ className }: { className?: string }) => <HeartHandshake className={className} />;
export const IconMenu = ({ className }: { className?: string }) => <Menu className={className} />;
export const IconClose = ({ className }: { className?: string }) => <X className={className} />;
export const IconSend = ({ className }: { className?: string }) => <Send className={className} />;
export const IconEdit = ({ className }: { className?: string }) => <Edit2 className={className} />;
export const IconLogOut = ({ className }: { className?: string }) => <LogOut className={className} />;
export const IconCamera = ({ className }: { className?: string }) => <Camera className={className} />;
export const IconCheck = ({ className }: { className?: string }) => <Check className={className} />;
export const IconSave = ({ className }: { className?: string }) => <Save className={className} />;
export const IconPlus = ({ className }: { className?: string }) => <Plus className={className} />;
export const IconGlobe = ({ className }: { className?: string }) => <Globe className={className} />;
export const IconUserPlus = ({ className }: { className?: string }) => <UserPlus className={className} />;
export const IconImage = ({ className }: { className?: string }) => <Image className={className} />;
export const IconTrash = ({ className }: { className?: string }) => <Trash2 className={className} />;
export const IconGavel = ({ className }: { className?: string }) => <Gavel className={className} />;
export const IconQuote = ({ className }: { className?: string }) => <Quote className={className} />;
export const IconLock = ({ className }: { className?: string }) => <Lock className={className} />;
export const IconMail = ({ className }: { className?: string }) => <Mail className={className} />;
export const IconFlame = ({ className }: { className?: string }) => <Flame className={className} />;
export const IconMic = ({ className }: { className?: string }) => <Mic className={className} />;
export const IconPlay = ({ className }: { className?: string }) => <Play className={className} />;
export const IconPause = ({ className }: { className?: string }) => <PauseCircle className={className} />;
export const IconCompass = ({ className }: { className?: string }) => <Compass className={className} />;
export const IconList = ({ className }: { className?: string }) => <LayoutList className={className} />;
export const IconArrowRight = ({ className }: { className?: string }) => <ArrowRight className={className} />;
export const IconArrowLeft = ({ className }: { className?: string }) => <ArrowLeft className={className} />;
export const IconUserCheck = ({ className }: { className?: string }) => <UserCheck className={className} />;
export const IconShield = ({ className }: { className?: string }) => <Shield className={className} />;
export const IconMessageSquare = ({ className }: { className?: string }) => <MessageSquare className={className} />;
export const IconInbox = ({ className }: { className?: string }) => <Inbox className={className} />;
export const IconInfo = ({ className }: { className?: string }) => <Info className={className} />;
export const IconChevronLeft = ({ className }: { className?: string }) => <ChevronLeft className={className} />;
export const IconChevronRight = ({ className }: { className?: string }) => <ChevronRight className={className} />;
export const IconBookmark = ({ className }: { className?: string }) => <Bookmark className={className} />;
export const IconSun = ({ className }: { className?: string }) => <Sun className={className} />;
export const IconAlert = ({ className }: { className?: string }) => <AlertTriangle className={className} />;
export const IconComms = ({ className }: { className?: string }) => <MessageCircleQuestion className={className} />;
export const IconSearch = ({ className }: { className?: string }) => <Search className={className} />;
export const IconBook = ({ className }: { className?: string }) => <Book className={className} />;
export const IconFilm = ({ className }: { className?: string }) => <Film className={className} />;
export const IconMusic = ({ className }: { className?: string }) => <Music className={className} />;
export const IconMaximize = ({ className }: { className?: string }) => <Maximize2 className={className} />;
export const IconMinimize = ({ className }: { className?: string }) => <Minimize2 className={className} />;
export const IconClock = ({ className }: { className?: string }) => <Clock className={className} />;
export const IconMicOff = ({ className }: { className?: string }) => <MicOff className={className} />;
export const IconUser = ({ className }: { className?: string }) => <User className={className} />;
export const IconBadgeCheck = ({ className }: { className?: string }) => <BadgeCheck className={className} />;
export const IconCrown = ({ className }: { className?: string }) => <Crown className={className} />;

// Turtle Icon for Slow Mode
export const IconTurtle = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m19 7.8-2.5-2.5" />
    <path d="m13.2 12.8-2.5-2.5" />
    <path d="M19.8 12.1c.9.2 1.9-.3 2.1-1.2.2-.9-.3-1.9-1.2-2.1l-1.3-.3c-1.3-.4-2.8-.2-4.1.4l-.5.3c-.6.3-1 .9-1.2 1.5l-.2.9c-.2.9.3 1.9 1.2 2.1l5.2 1.4v-.1Z" />
    <path d="M6.3 13.9c-.9-.2-1.9.3-2.1 1.2-.2.9.3 1.9 1.2 2.1l1.3.3c1.3.4 2.8.2 4.1-.4l.5-.3c.6-.3 1-.9 1.2-1.5l.2-.9c.2-.9-.3-1.9-1.2-2.1L6.3 13.9v.1Z" />
    <path d="M11 4a5 5 0 0 0-4.8 6.4L2.8 11.2a2.3 2.3 0 0 0 .5 4.3l1.8.4a7 7 0 0 0 8.1 3.5l2.2-.5a2.3 2.3 0 0 0 1.2-4l-.9-3.2A5 5 0 0 0 11 4Z" />
  </svg>
);


// Reaction Icons
export const IconInsight = ({ className }: { className?: string }) => <Lightbulb className={className} />;
export const IconPractical = ({ className }: { className?: string }) => <Wrench className={className} />;
export const IconAmplifier = ({ className }: { className?: string }) => <Megaphone className={className} />;
export const IconThanks = ({ className }: { className?: string }) => <Heart className={className} />;