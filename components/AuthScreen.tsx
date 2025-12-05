import React, { useState, useEffect } from 'react';
import { IconVitality, IconLock, IconMail, IconCheck, IconPockets, IconArbiter, IconDeep, IconQuote } from './Icons';
import { supabase } from '../supabaseClient';
import { getDailyPrompt } from '../constants';

interface AuthScreenProps {
  onSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true); // Default to Login for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dailyTeaser, setDailyTeaser] = useState('');
  
  // Register State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerHandle, setRegisterHandle] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Handle
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    // Show the consistent daily prompt instead of a random one
    setDailyTeaser(getDailyPrompt());
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegisterName(val);
    if (!registerHandle || registerHandle === '@') {
      const suggested = '@' + val.toLowerCase().replace(/\s+/g, '').slice(0, 10);
      setRegisterHandle(suggested);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (registerPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    const formattedHandle = registerHandle.startsWith('@') ? registerHandle : `@${registerHandle}`;

    try {
      const { data: existingHandle, error: handleCheckError } = await supabase
        .from('profiles')
        .select('handle')
        .eq('handle', formattedHandle)
        .maybeSingle();

      if (handleCheckError) throw new Error("Erro ao verificar nome de usuário.");
      if (existingHandle) {
        setError(`O usuário ${formattedHandle} já existe.`);
        setIsLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: { data: { name: registerName, handle: formattedHandle } }
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) throw new Error("E-mail já cadastrado.");
        throw signUpError;
      }

      if (data.user) {
        setSuccessMessage("Conta criada! Faça login para começar.");
        setIsLoginMode(true);
        setLoginIdentifier(registerEmail);
        setLoginPassword('');
        setRegisterName('');
        setRegisterEmail('');
        setRegisterHandle('');
        setRegisterPassword('');
        setConfirmPassword('');
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    let signInEmail = loginIdentifier.trim();
    // Check if input looks like an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInEmail);

    try {
      // Logic for Login by Username (Handle)
      if (!isEmail) {
         let handle = signInEmail;
         if (!handle.startsWith('@')) handle = `@${handle}`;

         // Attempt to fetch email from profiles based on handle
         const { data, error } = await supabase
           .from('profiles')
           .select('email') // This column must exist in public.profiles for this to work
           .eq('handle', handle)
           .single();
         
         if (error || !data?.email) {
           // Provide a specific hint if lookup fails
           throw new Error('Usuário não encontrado ou login por handle indisponível. Tente seu e-mail.');
         }
         signInEmail = data.email;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: loginPassword,
      });

      if (signInError) throw signInError;
      if (data.user) onSuccess();
    } catch (err: any) {
      // General error fallback
      const msg = err.message === 'Invalid login credentials' 
        ? 'Credenciais inválidas.' 
        : err.message;
      setError(msg || 'Erro ao entrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pulse-dark flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* --- Left Side: Manifesto & Value Prop --- */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative z-10 bg-gradient-to-br from-slate-900 via-pulse-dark to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-pulse-vitality/20 rounded-full blur-[100px]"></div>
         </div>

         <div className="max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-pulse-vitality rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <IconVitality className="text-pulse-dark w-7 h-7" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">PULSE<span className="text-pulse-vitality">OUT</span></h1>
            </div>

            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
              Supere o <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pulse-vitality to-yellow-600">Superficial.</span>
            </h2>

            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
               A rede social desenhada para restaurar a qualidade da conexão humana. Sem algoritmos de vício, apenas comunidades intencionais e conversas que importam.
            </p>

            {/* Daily Teaser Card */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl mb-10 backdrop-blur-sm relative group hover:border-pulse-vitality/50 transition-colors">
               <IconQuote className="absolute top-4 right-4 text-slate-600 w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity" />
               <p className="text-xs font-bold text-pulse-vitality uppercase tracking-widest mb-2">Reflexão do Dia</p>
               <p className="text-white text-xl font-serif italic">"{dailyTeaser}"</p>
               <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>42 pessoas debatendo isso agora no Global Pulse.</span>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="flex flex-col gap-2">
                  <IconPockets className="text-indigo-400 w-6 h-6" />
                  <span className="font-bold text-white">Pockets</span>
                  <span className="text-xs text-slate-500">Grupos limitados a 50 pessoas.</span>
               </div>
               <div className="flex flex-col gap-2">
                  <IconDeep className="text-emerald-400 w-6 h-6" />
                  <span className="font-bold text-white">Profundidade</span>
                  <span className="text-xs text-slate-500">Recompensas por conteúdo denso.</span>
               </div>
               <div className="flex flex-col gap-2">
                  <IconArbiter className="text-rose-400 w-6 h-6" />
                  <span className="font-bold text-white">Árbitros</span>
                  <span className="text-xs text-slate-500">Moderação humana e justa.</span>
               </div>
            </div>
         </div>
      </div>

      {/* --- Right Side: Auth Forms --- */}
      <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-pulse-base">
        <div className="w-full max-w-md">
           
           {/* Mobile Header (Only visible on small screens) */}
           <div className="lg:hidden text-center mb-8">
              <h3 className="text-xl font-bold text-white">Bem-vindo de volta</h3>
           </div>

           {/* Auth Card */}
           <div className="bg-pulse-dark border border-slate-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex border-b border-slate-800 mb-8">
                <button 
                  onClick={() => { setIsLoginMode(true); setError(null); setSuccessMessage(null); }}
                  className={`flex-1 pb-4 text-sm font-bold transition-all border-b-2 ${isLoginMode ? 'text-white border-pulse-vitality' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                  Entrar
                </button>
                <button 
                  onClick={() => { setIsLoginMode(false); setError(null); setSuccessMessage(null); }}
                  className={`flex-1 pb-4 text-sm font-bold transition-all border-b-2 ${!isLoginMode ? 'text-white border-pulse-vitality' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                  Cadastrar
                </button>
              </div>

              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                  <IconCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <p className="text-emerald-200 text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center font-medium animate-pulse">
                  {error}
                </div>
              )}

              {isLoginMode ? (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">E-mail ou Usuário</label>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                      <input 
                        required
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white focus:border-pulse-vitality focus:outline-none transition-colors placeholder-slate-600"
                        placeholder="seu@email.com ou @usuario"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Senha</label>
                    <div className="relative">
                      <IconLock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input 
                        required
                        type="password" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white focus:border-pulse-vitality focus:outline-none transition-colors placeholder-slate-600"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-200 text-pulse-dark font-bold py-4 rounded-xl transition-all shadow-lg mt-4"
                  >
                    {isLoading ? 'Entrando...' : 'Acessar Comunidade'}
                  </button>
                  
                  <div className="text-center mt-4">
                     <span className="text-slate-500 text-xs">Esqueceu a senha? </span>
                     <button type="button" className="text-pulse-vitality text-xs font-bold hover:underline">Recuperar acesso</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Nome</label>
                    <input 
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-pulse-vitality focus:outline-none"
                      placeholder="Seu nome"
                      value={registerName}
                      onChange={handleNameChange}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">E-mail</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-pulse-vitality focus:outline-none"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Handle (@)</label>
                    <input 
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-pulse-vitality focus:outline-none"
                      placeholder="@usuario"
                      value={registerHandle}
                      onChange={(e) => setRegisterHandle(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Senha</label>
                      <input 
                        required
                        type="password" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-pulse-vitality focus:outline-none"
                        placeholder="••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Confirmar</label>
                      <input 
                        required
                        type="password" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-pulse-vitality focus:outline-none"
                        placeholder="••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-pulse-vitality hover:bg-yellow-400 text-pulse-dark font-bold py-4 rounded-xl shadow-lg mt-4 disabled:opacity-50"
                  >
                    {isLoading ? 'Registrando...' : 'Criar Conta'}
                  </button>
                </form>
              )}
           </div>
           
           <p className="text-center text-slate-600 text-xs mt-6">
             Ao entrar, você concorda com o nosso <span className="underline cursor-pointer">Pacto de Não-Toxicidade</span>.
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;