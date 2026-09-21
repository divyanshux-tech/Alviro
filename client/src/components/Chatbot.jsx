import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    MessageSquare, X, Send, Sparkles, Calendar, RefreshCw,
    Mic, MicOff, Volume2, VolumeX, ShoppingCart, Plus, Minus,
    Trash2, ArrowLeft, CheckCircle, ChevronRight, UtensilsCrossed
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL, AI_API_URL } from '../config';
import { useCart } from '../context/CartContext';

/* ─────────────── helpers ─────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });

/* ─────────────── inline markdown renderer ─────────────── */
function BotText({ text, onOptionClick, cartActions = {}, suggestedDishes = [], liveMenu = [] }) {
    const { addToCart, updateQty, removeFromCart, getItemQty } = cartActions;

    return (
        <div>
            {text.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-2" />;
                if (trimmed.startsWith('### ')) {
                    const label = trimmed.replace('### ', '').replace(/\*\*/g, '');
                    return (
                        <div key={i} className="flex items-center gap-2 mt-3 mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">{label}</span>
                            <div className="flex-1 h-px bg-amber-500/20" />
                        </div>
                    );
                }
                if (trimmed.startsWith('•')) {
                    const content = trimmed.slice(1).trim();
                    const hasDash = content.includes(' — ');
                    const hasPrice = content.includes('($');
                    if (!hasDash && !hasPrice) {
                        const optionText = content.replace(/\*\*/g, '').trim();
                        return (
                            <button key={i}
                                onClick={() => onOptionClick(optionText)}
                                className="w-full text-left my-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-white font-medium text-xs flex items-center justify-between group transition-all duration-200">
                                <span>{optionText}</span>
                                <span className="text-amber-400 group-hover:translate-x-1 transition-transform text-sm font-bold">→</span>
                            </button>
                        );
                    }
                    const dashIdx = content.indexOf(' — ');
                    const leftRaw = dashIdx !== -1 ? content.slice(0, dashIdx) : content;
                    const desc = dashIdx !== -1 ? content.slice(dashIdx + 3) : '';
                    const nameMatch = leftRaw.match(/\*\*(.+?)\*\*/);
                    const priceMatch = leftRaw.match(/\(\$([0-9.]+)\)/);
                    const tagMatch = leftRaw.match(/\*\((.+?)\)\*/);
                    const name = nameMatch ? nameMatch[1] : leftRaw.replace(/\*\*/g, '').trim();
                    const rawPrice = priceMatch ? priceMatch[1] : '';
                    const price = rawPrice ? `$${rawPrice}` : '';
                    const tag = tagMatch ? tagMatch[1] : '';

                    // Find matching dish object or build fallback
                    const matchedDish = (suggestedDishes || []).find(d => d.name?.toLowerCase() === name.toLowerCase())
                        || (liveMenu || []).find(d => d.name?.toLowerCase() === name.toLowerCase());

                    const dishObj = matchedDish || {
                        _id: name,
                        menuItemId: name,
                        name: name,
                        price: rawPrice ? parseFloat(rawPrice) : 0,
                        description: desc,
                        category: tag || 'Mains'
                    };

                    const cartId = String(dishObj._id || dishObj.menuItemId || dishObj.id || dishObj.name);
                    const qty = getItemQty ? getItemQty(cartId) : 0;
                    const inCart = qty > 0;

                    return (
                        <div key={i} className="mb-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all shadow-md">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="text-white font-semibold text-[13px] leading-tight">{name}</span>
                                {price && <span className="text-amber-300 font-bold text-[12px] shrink-0">{price}</span>}
                            </div>
                            {tag && <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-green-900/50 text-green-300 border border-green-700/40 mb-1">{tag}</span>}
                            {desc && <p className="text-gray-400 text-[11px] leading-relaxed mb-1">{desc}</p>}

                            {addToCart && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                                    {inCart ? (
                                        <>
                                            <button onClick={() => updateQty(cartId, -1)}
                                                className="w-6 h-6 rounded-full bg-white/10 hover:bg-amber-500/30 text-white flex items-center justify-center transition-all">
                                                <Minus size={11} />
                                            </button>
                                            <span className="text-white font-bold text-xs w-4 text-center">{qty}</span>
                                            <button onClick={() => updateQty(cartId, 1)}
                                                className="w-6 h-6 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 flex items-center justify-center transition-all">
                                                <Plus size={11} />
                                            </button>
                                            <span className="text-[10px] text-amber-400/90 font-medium ml-1">In Cart</span>
                                            <button onClick={() => removeFromCart(cartId)}
                                                className="ml-auto px-2 py-0.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-[10px] font-semibold flex items-center gap-1 transition-all">
                                                <Trash2 size={10} /> Remove
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => addToCart(dishObj)}
                                            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-primary to-amber-600 text-black text-[11px] font-bold flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md shadow-primary/20">
                                            <Plus size={12} /> Add to Cart
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }
                const renderInline = (t) => {
                    const parts = t.split(/\*\*(.+?)\*\*/g);
                    return parts.map((part, pi) =>
                        pi % 2 === 1
                            ? <strong key={pi} className="text-white font-semibold">{part}</strong>
                            : <span key={pi}>{part.replace(/\*/g, '')}</span>
                    );
                };
                if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
                    return <p key={i} className="text-amber-200/70 italic text-[12px] mt-2">{trimmed.slice(1, -1)}</p>;
                }
                return <p key={i} className="text-gray-200 text-[13px] leading-relaxed mb-1">{renderInline(trimmed)}</p>;
            })}
        </div>
    );
}

/* ─────────────── dish card (with +/- and remove) ─────────────── */
function DishCard({ dish, cartQty, onAdd, onInc, onDec, onRemove }) {
    const inCart = cartQty > 0;
    return (
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex justify-between items-start mb-1">
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-[13px] leading-tight truncate">{dish.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{dish.category}</p>
                </div>
                <span className="text-amber-300 font-bold text-[12px] shrink-0 ml-2">
                    {dish.price ? `$${fmt(dish.price)}` : ''}
                </span>
            </div>
            {dish.description && (
                <p className="text-gray-400 text-[11px] leading-relaxed mt-1 mb-2 line-clamp-2">{dish.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
                {inCart ? (
                    <>
                        <button onClick={onDec}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-amber-500/30 text-white flex items-center justify-center transition-all">
                            <Minus size={12} />
                        </button>
                        <span className="text-white font-bold text-sm w-5 text-center">{cartQty}</span>
                        <button onClick={onInc}
                            className="w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 flex items-center justify-center transition-all">
                            <Plus size={12} />
                        </button>
                        <button onClick={onRemove}
                            className="ml-auto px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-[10px] font-semibold flex items-center gap-1 transition-all">
                            <Trash2 size={10} /> Remove
                        </button>
                    </>
                ) : (
                    <button onClick={onAdd}
                        className="w-full py-1.5 rounded-xl bg-gradient-to-r from-primary to-amber-600 text-black text-[11px] font-bold flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all shadow-md shadow-primary/20">
                        <Plus size={12} /> Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN CHATBOT COMPONENT
═══════════════════════════════════════════════════ */
const Chatbot = () => {
    const location = useLocation();
    if (location.pathname.startsWith('/admin')) return null;

    const { cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, getItemQty } = useCart();

    /* ─ chat state ─ */
    const [isOpen, setIsOpen] = useState(false);
    const [screen, setScreen] = useState('chat');
    const [resStep, setResStep] = useState(0);
    const [resData, setResData] = useState({ guests: '', date: '', time: '', name: '', contact: '' });
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const currentAudioRef = useRef(null);

    /* ─ fetch initial greeting dynamically ─ */
    useEffect(() => {
        if (isOpen && messages.length === 0 && !isLoading) {
            const fetchGreeting = async () => {
                setIsLoading(true);
                try {
                    const res = await axios.post(`${AI_API_URL}/api/ai/chat`, {
                        message: "Hello! Please introduce yourself warmly and ask how you can help me today.",
                        session_id: sessionId,
                        history: [],
                        cart_context: ''
                    });

                    const botReply = res.data.reply || "Welcome to Al Viro!";
                    const voiceText = res.data.voice_summary || botReply.replace(/[*#•]/g, '').substring(0, 220);
                    
                    setMessages([{
                        id: Date.now(),
                        text: botReply,
                        sender: 'bot',
                        dishes: res.data.suggested_dishes || [],
                        actionType: res.data.action_type || 'chat',
                        quickReplies: res.data.quick_replies || []
                    }]);
                    speakText(voiceText);
                } catch (err) {
                    setMessages([{
                        id: Date.now(),
                        text: "Welcome to Al Viro! How can I help you today?",
                        sender: 'bot',
                        dishes: [],
                        actionType: 'chat',
                        quickReplies: ['Show me the menu', 'Book a table']
                    }]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchGreeting();
        }
    }, [isOpen, messages.length, sessionId]);

    /* ─ voice state ─ */
    const [isListening, setIsListening] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    /* ─ menu browse state ─ */
    const [liveMenu, setLiveMenu] = useState([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    /* ─────────────── scroll ─────────────── */
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen, isLoading, screen]);

    /* ─────────────── speech recognition ─────────────── */
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const rec = new SR();
        rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US';
        rec.onstart = () => setIsListening(true);
        rec.onresult = (e) => { const t = e.results[0][0].transcript; if (t) { setInput(t); handleSend(null, t); } };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) { alert('Speech recognition not supported. Use Chrome or Edge.'); return; }
        if (isListening) { recognitionRef.current.stop(); }
        else { if (window.speechSynthesis) window.speechSynthesis.cancel(); recognitionRef.current.start(); }
    };

    /* ─────────────── Backend TTS — ElevenLabs Quality ─────────────── */
    const speakText = async (text) => {
        if (!isVoiceEnabled) return;
        try {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
            // Clean text before sending to backend
            const clean = text
                .replace(/\*\*/g, '').replace(/\*/g, '')
                .replace(/#{1,3}\s/g, '')
                .replace(/[•🎉🍷🍝🍕🧀🌿🍽️😊🌟✨🎊]/g, '')
                .replace(/\(\$[\d.]+\)/g, match => match.replace('$', 'dollars '))
                .replace(/\s+/g, ' ').trim();
            if (!clean) return;
            
            const apiUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api/ai';
            const audioUrl = `${apiUrl}/tts?text=${encodeURIComponent(clean)}`;
            
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;
            
            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            
            await audio.play();
        } catch (e) {
            console.error("TTS playback error:", e);
            setIsSpeaking(false);
        }
    };

    const toggleVoice = () => {
        if (isVoiceEnabled && currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
            setIsSpeaking(false);
        }
        setIsVoiceEnabled(p => !p);
    };

    /* ─────────────── live menu loader ─────────────── */
    const loadMenu = useCallback(async () => {
        if (liveMenu.length > 0) return;
        setMenuLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/menu`);
            if (Array.isArray(res.data) && res.data.length > 0) { 
                setLiveMenu(res.data); 
                setMenuLoading(false);
                return; 
            }
        } catch {}
        try {
            const res = await axios.get(`${AI_API_URL}/api/ai/menu-items`);
            if (res.data?.dishes) setLiveMenu(res.data.dishes);
        } catch {}
        setMenuLoading(false);
    }, [liveMenu.length]);

    const openMenuBrowse = () => { loadMenu(); setScreen('menu_browse'); };

    useEffect(() => {
        if (isOpen) { loadMenu(); }
    }, [isOpen, loadMenu]);

    /* ─────────────── menu categories ─────────────── */
    const categories = ['All', ...Array.from(new Set(liveMenu.map(d => d.category).filter(Boolean)))];
    const filteredMenu = activeCategory === 'All' ? liveMenu : liveMenu.filter(d => d.category === activeCategory);

    /* ─────────────── dynamic quick chips from AI ─────────────── */
    const quickChips = React.useMemo(() => {
        const lastBot = [...messages].reverse().find(m => m.sender === 'bot');
        // Use AI-returned quick_replies if available
        if (lastBot?.quickReplies?.length) return lastBot.quickReplies;
        // Contextual fallbacks
        const at = lastBot?.actionType;
        if (at === 'reservation_prompt') return ['Any pasta options?', 'View cart', 'What\'s gluten-free?'];
        if (at === 'reservation_confirmed') return ['Browse menu', 'What should I try?', 'Opening hours'];
        if (at === 'dishes_text') return ['Book a table', 'Show full menu', 'Any vegan options?', 'What\'s popular?'];
        return ['Show me the menu', 'Book a table', 'What\'s popular today?', 'Vegetarian options'];
    }, [messages]);

    /* ─────────────── main send handler — ALL messages go to AI ─────────────── */
    const handleSend = async (e, forcedInput = null) => {
        if (e && e.preventDefault) e.preventDefault();
        const msgText = (forcedInput || input).trim();
        if (!msgText || isLoading) return;
        setInput('');

        // Add user message immediately
        setMessages(p => [...p, { id: Date.now(), text: msgText, sender: 'user' }]);
        setIsLoading(true);

        try {
            const historyPayload = messages.slice(-8).map(m => ({ sender: m.sender, text: m.text }));
            const cartContext = cart.length > 0 ? cart.map(i => `${i.name} x${i.quantity}`).join(', ') : '';

            const res = await axios.post(`${AI_API_URL}/api/ai/chat`, {
                message: msgText,
                session_id: sessionId,
                history: historyPayload,
                cart_context: cartContext
            });

            const botReply = res.data.reply || "I'm sorry, I didn't quite catch that. Could you try again?";
            const voiceText = res.data.voice_summary || botReply.replace(/[*#•]/g, '').substring(0, 220);
            const suggested = res.data.suggested_dishes || [];
            const actionType = res.data.action_type || 'chat';
            const aiQuickReplies = res.data.quick_replies || [];

            // Handle UI screen changes from AI action_type
            if (actionType === 'open_menu_browser') {
                openMenuBrowse();
            } else if (actionType === 'full_menu') {
                openMenuBrowse();
            } else if (actionType === 'show_cart') {
                setScreen('cart');
            }

            setMessages(p => [...p, {
                id: Date.now() + 1,
                text: botReply,
                sender: 'bot',
                dishes: suggested,
                actionType,
                quickReplies: aiQuickReplies
            }]);

            speakText(voiceText);
        } catch (err) {
            const fb = "I'm having a little trouble connecting right now. Could you try again in a moment? 😊";
            setMessages(p => [...p, {
                id: Date.now() + 1,
                text: fb,
                sender: 'bot',
                dishes: [],
                actionType: 'chat',
                quickReplies: ['Show me the menu', 'Book a table']
            }]);
            speakText(fb);
        } finally {
            setIsLoading(false);
        }
    };

    const addBotMsg = (text, actionType = 'chat', dishes = [], quickReplies = []) => {
        setMessages(p => [...p, { id: Date.now() + 1, text, sender: 'bot', dishes, actionType, quickReplies }]);
        speakText(text.replace(/[*#•]/g, '').substring(0, 200));
    };

    /* ─────────────── confirmation screen data ─────────────── */
    const ConfirmScreen = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => { setResStep(6); setScreen('chat'); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400">
                    <ArrowLeft size={16} />
                </button>
                <h3 className="text-white font-bold text-sm">Confirm Your Reservation</h3>
            </div>

            {/* Reservation summary */}
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30">
                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Calendar size={12} /> Table Reservation
                </p>
                {[
                    ['Date', resData.date], ['Time', resData.time],
                    ['Guests', resData.guests], ['Name', resData.name], ['Contact', resData.contact]
                ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-white font-semibold">{v}</span>
                    </div>
                ))}
                <button onClick={() => { setResStep(1); setScreen('chat'); addBotMsg("Sure! Let's update your reservation. For how many guests?", 'reservation_prompt'); }}
                    className="mt-3 w-full text-[10px] text-amber-400 hover:text-amber-300 transition-colors">
                    ✏️ Edit Reservation
                </button>
            </div>

            {/* Cart summary */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                <p className="text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <ShoppingCart size={12} /> Pre-Order {cart.length > 0 ? `(${cartCount} items)` : '— None'}
                </p>
                {cart.length === 0 ? (
                    <p className="text-gray-500 text-xs text-center py-2">No items in cart</p>
                ) : (
                    <div className="space-y-2">
                        {cart.map(item => (
                            <div key={item._cartId} className="flex items-center gap-2">
                                <span className="text-white text-xs flex-1 truncate">{item.name}</span>
                                <button onClick={() => updateQty(item._cartId, -1)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><Minus size={10} /></button>
                                <span className="text-amber-300 font-bold text-xs w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQty(item._cartId, 1)} className="w-6 h-6 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center"><Plus size={10} /></button>
                                <button onClick={() => removeFromCart(item._cartId)} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={11} /></button>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
                            <span className="text-gray-400">Items</span>
                            <span className="text-white font-bold">{cartCount} dishes</span>
                        </div>
                    </div>
                )}
                <button onClick={openMenuBrowse}
                    className="mt-3 w-full text-[10px] text-amber-400 hover:text-amber-300 transition-colors">
                    ✏️ Edit Pre-Order
                </button>
            </div>

            <button onClick={submitReservation}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-amber-600 text-black font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Confirm Reservation
            </button>
        </div>
    );

    /* ─────────────── cart screen ─────────────── */
    const CartScreen = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setScreen('chat')} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400">
                    <ArrowLeft size={16} />
                </button>
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <ShoppingCart size={16} className="text-amber-400" /> Your Cart
                    {cartCount > 0 && <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">{cartCount} items</span>}
                </h3>
            </div>

            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingCart size={36} className="text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm font-medium">Your cart is empty</p>
                    <p className="text-gray-600 text-xs mt-1">Browse the menu to add dishes</p>
                    <button onClick={openMenuBrowse}
                        className="mt-4 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-xs font-semibold transition-all">
                        Browse Menu
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {cart.map(item => (
                            <div key={item._cartId} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-xs truncate">{item.name}</p>
                                    <p className="text-gray-500 text-[10px]">{item.category}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => updateQty(item._cartId, -1)}
                                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                                        <Minus size={10} />
                                    </button>
                                    <span className="text-white font-bold text-xs w-5 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQty(item._cartId, 1)}
                                        className="w-6 h-6 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 flex items-center justify-center transition-all">
                                        <Plus size={10} />
                                    </button>
                                    <button onClick={() => removeFromCart(item._cartId)}
                                        className="ml-1 p-1.5 rounded-full bg-red-950/50 hover:bg-red-900/60 text-red-400 transition-all">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center px-1 py-2 border-t border-white/10">
                        <span className="text-gray-400 text-xs">Total Items</span>
                        <span className="text-white font-bold text-sm">{cartCount} dishes</span>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                        <button onClick={openMenuBrowse}
                            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2">
                            <UtensilsCrossed size={14} /> Continue Shopping
                        </button>
                        <button
                            onClick={() => {
                                if (resStep === 6) { setResStep(7); setScreen('confirm'); }
                                else { setScreen('chat'); setResStep(1); addBotMsg("Let's book your table! 🍷\n\nFor how many **guests**?", 'reservation_prompt'); }
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-amber-600 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                            <Calendar size={14} /> Book a Table
                        </button>
                        <button onClick={clearCart}
                            className="w-full py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/30 text-red-400 text-xs font-semibold transition-all">
                            Clear Cart
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    /* ─────────────── menu browse screen ─────────────── */
    const MenuBrowseScreen = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <button onClick={() => setScreen('chat')} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400">
                    <ArrowLeft size={16} />
                </button>
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <UtensilsCrossed size={15} className="text-primary" /> Browse Menu
                </h3>
                {resStep === 6 && (
                    <button onClick={() => { setResStep(7); setScreen('confirm'); }}
                        className="ml-auto px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-[10px] font-bold transition-all">
                        Done → Review Order
                    </button>
                )}
            </div>

            {/* category tabs */}
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none border-b border-white/5">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${activeCategory === cat
                            ? 'bg-primary text-black shadow-md shadow-primary/30'
                            : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* dishes */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {menuLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Sparkles size={20} className="text-primary animate-spin mr-2" />
                        <span className="text-gray-400 text-sm">Loading menu...</span>
                    </div>
                ) : filteredMenu.length === 0 ? (
                    <p className="text-gray-500 text-xs text-center py-8">No dishes available in this category.</p>
                ) : (
                    filteredMenu.map(dish => {
                        const cartId = String(dish._id || dish.id || dish.name);
                        const qty = getItemQty(cartId);
                        return (
                            <DishCard
                                key={cartId}
                                dish={dish}
                                cartQty={qty}
                                onAdd={() => addToCart(dish)}
                                onInc={() => updateQty(cartId, 1)}
                                onDec={() => updateQty(cartId, -1)}
                                onRemove={() => removeFromCart(cartId)}
                            />
                        );
                    })
                )}
            </div>

            {/* sticky cart bar */}
            {cartCount > 0 && (
                <div className="px-3 py-2.5 bg-black/80 border-t border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={15} className="text-amber-400" />
                        <span className="text-white text-xs font-bold">{cartCount} item{cartCount > 1 ? 's' : ''} in cart</span>
                    </div>
                    <button onClick={() => setScreen('cart')}
                        className="px-3 py-1.5 bg-primary text-black text-[10px] font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-1">
                        View Cart <ChevronRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );

    /* ═══════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════ */
    return (
        <>
            {/* Floating launcher */}
            <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[90] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all
                    ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'bg-gradient-to-r from-primary via-amber-500 to-amber-700 text-white shadow-primary/40'}`}
                title="Open DineMate AI Voice Assistant"
            >
                <div className="relative">
                    <MessageSquare size={24} />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-400 border-2 border-black rounded-full text-black text-[9px] font-bold flex items-center justify-center">
                            {cartCount > 9 ? '9+' : cartCount}
                        </span>
                    )}
                    {cartCount === 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full animate-pulse" />
                    )}
                </div>
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.96 }}
                        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px]
                        h-[calc(100vh-5rem)] max-h-[600px]
                        bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 bg-gradient-to-r from-[#141414] via-[#1c140a] to-[#141414] border-b border-primary/20 px-4 py-3 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center shadow-lg border border-primary/40 flex-shrink-0">
                                    <Sparkles size={15} className="text-white" />
                                    {isSpeaking && <span className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-ping opacity-60" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-header font-bold text-sm tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-200 to-primary leading-tight">DineMate</h3>
                                        <span className="px-1.5 text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">Voice AI</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-tight">
                                        {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'AI Dining Assistant'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Cart button in header */}
                                <button onClick={() => setScreen(screen === 'cart' ? 'chat' : 'cart')}
                                    className="relative p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-amber-300 transition-colors"
                                    title="View Cart">
                                    <ShoppingCart size={15} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary border border-black rounded-full text-black text-[8px] font-bold flex items-center justify-center">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </button>
                                <button onClick={toggleVoice}
                                    className={`p-1.5 rounded-full transition-colors ${isVoiceEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:bg-white/10'}`}>
                                    {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                                </button>
                                <button onClick={() => {
                                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                                    setSessionId('sess_' + Math.random().toString(36).substring(2, 9));
                                    setMessages([]);
                                    setScreen('chat');
                                }} title="Reset" className="hover:bg-white/10 p-1.5 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <RefreshCw size={13} />
                                </button>
                                <button onClick={() => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setIsOpen(false); }}
                                    className="hover:bg-white/10 p-1.5 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Screen router */}
                        <AnimatePresence mode="wait">
                            {screen === 'menu_browse' && (
                                <motion.div key="menu" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col overflow-hidden">
                                    <MenuBrowseScreen />
                                </motion.div>
                            )}
                            {screen === 'cart' && (
                                <motion.div key="cart" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col overflow-hidden">
                                    <CartScreen />
                                </motion.div>
                            )}
                            {screen === 'confirm' && (
                                <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }} className="flex-1 flex flex-col overflow-hidden">
                                    <ConfirmScreen />
                                </motion.div>
                            )}
                            {screen === 'chat' && (
                                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 flex flex-col overflow-hidden">
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-black/40 to-black/80 scrollbar-thin scrollbar-thumb-white/10">
                                        {messages.map(msg => (
                                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-xl backdrop-blur-md
                                                    ${msg.sender === 'user'
                                                        ? 'bg-gradient-to-br from-primary via-amber-600 to-amber-700 text-white rounded-br-none border border-primary/40 shadow-primary/20'
                                                        : 'bg-white/10 border border-white/10 text-gray-100 rounded-bl-none'}`}>
                                                    {msg.sender === 'bot' ? (
                                                        <>
                                                            <BotText
                                                                text={msg.text}
                                                                onOptionClick={(t) => handleSend(null, t)}
                                                                cartActions={{ addToCart, updateQty, removeFromCart, getItemQty }}
                                                                suggestedDishes={msg.dishes}
                                                                liveMenu={liveMenu}
                                                            />
                                                            {msg.dishes && msg.dishes.length > 0 && !msg.text.includes('•') && (
                                                                <div className="mt-3 space-y-2 pt-2 border-t border-white/10">
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Suggested Dishes</p>
                                                                    {msg.dishes.map((dish, idx) => {
                                                                        const cartId = String(dish._id || dish.menuItemId || dish.id || dish.name);
                                                                        const qty = getItemQty(cartId);
                                                                        return (
                                                                            <DishCard
                                                                                key={idx}
                                                                                dish={dish}
                                                                                cartQty={qty}
                                                                                onAdd={() => addToCart(dish)}
                                                                                onInc={() => updateQty(cartId, 1)}
                                                                                onDec={() => updateQty(cartId, -1)}
                                                                                onRemove={() => removeFromCart(cartId)}
                                                                            />
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-[13px]">{msg.text}</p>
                                                    )}

                                                    {msg.actionType === 'item_not_found' && (
                                                        <div className="mt-2 p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 animate-pulse" />
                                                            Not available on Al Viro's menu
                                                        </div>
                                                    )}
                                                    {msg.actionType === 'reservation_confirmed' && (
                                                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-black border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
                                                            <Calendar size={18} className="text-emerald-400 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Table Successfully Booked</p>
                                                                <p className="text-[10px] text-emerald-300/80">Saved to restaurant database</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {isListening && (
                                            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center justify-between animate-pulse">
                                                <div className="flex items-center gap-2 text-red-300 text-xs font-medium">
                                                    <Mic size={16} className="text-red-400 animate-bounce" />
                                                    <span>Listening... Speak now!</span>
                                                </div>
                                                <button onClick={toggleListening} className="text-[10px] px-2 py-0.5 bg-red-600/60 text-white rounded-full hover:bg-red-600">Stop</button>
                                            </div>
                                        )}
                                        {isLoading && (
                                            <div className="flex items-center gap-2 text-gray-400 text-xs py-2 px-3 bg-white/5 border border-white/10 rounded-2xl w-fit">
                                                <Sparkles size={14} className="text-primary animate-spin" />
                                                <span>DineMate is thinking...</span>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Quick chips */}
                                    <div className="px-3 py-2 flex flex-wrap gap-1.5 bg-black/40 border-t border-white/5">
                                        {quickChips.map(s => (
                                            <button key={s} onClick={() => handleSend(null, s)}
                                                className="px-2.5 py-1 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 rounded-full text-[11px] text-gray-300 hover:text-white transition-all duration-200">
                                                {s}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <div className="p-3 bg-black/60 border-t border-white/10">
                                        <form onSubmit={handleSend} className="relative flex items-center gap-2">
                                            <div className="relative flex-1 flex items-center">
                                                <input
                                                    type="text" value={input} onChange={e => setInput(e.target.value)}
                                                    placeholder={isListening ? 'Listening to you...' : 'Speak or type your message...'}
                                                    disabled={isLoading}
                                                    className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/15 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all backdrop-blur-md"
                                                />
                                                <button type="button" onClick={toggleListening}
                                                    className={`absolute right-1.5 p-2 rounded-full transition-all duration-300 ${isListening ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/50' : 'text-gray-400 hover:text-amber-400 hover:bg-white/10'}`}>
                                                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                                                </button>
                                            </div>
                                            <button type="submit" disabled={isLoading || !input.trim()}
                                                className="p-3 bg-gradient-to-r from-primary to-amber-600 rounded-full text-white shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100">
                                                <Send size={15} />
                                            </button>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
