import React, { useEffect, useRef, useState } from 'react';
import { serverUrl } from '../config/api';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Code, ExternalLink, Eye, FileCode, LucideMonitor, MessageCircle, Rocket, Send, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { motion } from 'motion/react';
import { setUserData } from '../redux/userSlice';

const FALLBACK_CODING_MODELS = [
    { id: 'gpt-4o-mini', label: 'AICC GPT-4o-mini', providerNote: 'AICC', defaultMaxTokens: 8192, minMaxTokens: 1024, maxMaxTokens: 16384 },
    { id: 'hf/qwen2.5-coder-32b', label: 'HuggingFace Qwen2.5 Coder 32B', providerNote: 'HuggingFace', defaultMaxTokens: 8192, minMaxTokens: 1024, maxMaxTokens: 16384 },
    { id: 'mistral/codestral-latest', label: 'Mistral Codestral', providerNote: 'Mistral', defaultMaxTokens: 8192, minMaxTokens: 1024, maxMaxTokens: 16384 },
    { id: 'mistral/magistral-medium-latest', label: 'Mistral Magistral Medium', providerNote: 'Mistral', defaultMaxTokens: 8192, minMaxTokens: 1024, maxMaxTokens: 16384 },
    { id: 'mistral/mistral-small-latest', label: 'Mistral Small Latest', providerNote: 'Mistral', defaultMaxTokens: 8192, minMaxTokens: 1024, maxMaxTokens: 16384 },
    { id: 'groq/llama-3.1-8b-instant', label: 'Groq Llama 3.1 8B Instant', providerNote: 'Groq', defaultMaxTokens: 8192, minMaxTokens: 1024, maxMaxTokens: 16384 },
    { id: 'sambanova/deepseek-r1', label: 'Sambanova DeepSeek R1', providerNote: 'Sambanova', defaultMaxTokens: 8192, minMaxTokens: 1024, maxMaxTokens: 16384 }
];

const getTokenBounds = (model) => ({
    min: Number(model?.minMaxTokens) || 1024,
    max: Number(model?.maxMaxTokens) || 16384,
    def: Number(model?.defaultMaxTokens) || 8192
});


function WebsiteEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);
    const [website, setWebsite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState([]);
    const [prompt, setPrompt] = useState("");
    const iframeRef = useRef(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showFullPreview, setShowFullPreview] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [deployLoading, setDeployLoading] = useState(false);
    const [deployMessage, setDeployMessage] = useState("");
    const [deployError, setDeployError] = useState("");
    const [mobileView, setMobileView] = useState('preview');
    const [codingModels, setCodingModels] = useState(FALLBACK_CODING_MODELS);
    const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
    const [maxTokens, setMaxTokens] = useState(8192);

    const thinkingStep = [
        "Analyzing the prompt ...",
        "Generating the code ...",
        "Almost there ...",
        "Deploying the website ...",
        "All done!"

    ]

    // 🔥 Update Website
    const handleUpdateWebsite = async () => {
        const userPrompt = prompt.trim();
        if (!userPrompt) {
            setErrorMessage("Please enter a prompt before updating.");
            return;
        }

        setErrorMessage("");
        setUpdateLoading(true);
        setPrompt("");


        // add user message
        setMessage((m) => [
            ...m,
            { role: "user", content: userPrompt },
            { role: "assistant", content: thinkingStep[0], pending: true }
        ]);

        try {
            const result = await axios.post(
                `${serverUrl}/api/website/update/${id}`,
                { prompt: userPrompt, model: selectedModel, maxTokens },
                { withCredentials: true }
            );

            setUpdateLoading(false);

            // add assistant message
            setMessage((m) => {
                const updated = [...m];
                for (let i = updated.length - 1; i >= 0; i--) {
                    if (updated[i]?.pending) {
                        updated[i] = { role: "assistant", content: result.data.message };
                        return updated;
                    }
                }
                updated.push({ role: "assistant", content: result.data.message });
                return updated;
            });

            setCode(result.data.latestCode);

            if (typeof result?.data?.Remaining_credits === 'number') {
                dispatch(setUserData({
                    ...(userData || {}),
                    credits: result.data.Remaining_credits
                }));
            }

            // ✅ clear input (important UX fix)

        } catch (error) {
            setUpdateLoading(false);
            console.error(error);
            const failureMessage =
                error?.response?.data?.message ||
                "Failed to update website. Please try again.";

            setMessage((m) => {
                const updated = [...m];
                for (let i = updated.length - 1; i >= 0; i--) {
                    if (updated[i]?.pending) {
                        updated[i] = { role: "assistant", content: failureMessage };
                        return updated;
                    }
                }
                updated.push({ role: "assistant", content: failureMessage });
                return updated;
            });

            setErrorMessage(failureMessage);
        }
    };

    const handleDeployWebsite = async () => {
        if (!id) return;

        setDeployLoading(true);
        setDeployMessage("");
        setDeployError("");
        try {
            const result = await axios.post(
                `${serverUrl}/api/website/deploy/${id}`,
                {},
                { withCredentials: true }
            );

            const deployURL = result?.data?.deployURL || "";
            setWebsite((prev) =>
                prev
                    ? {
                          ...prev,
                          deployed: true,
                          deployURL
                      }
                    : prev
            );
            setDeployMessage(result?.data?.message || "Website deployed successfully.");
        } catch (error) {
            console.error(error);
            setDeployError(error?.response?.data?.message || "Failed to deploy website.");
        } finally {
            setDeployLoading(false);
        }
    };

    const handleOpenLive = () => {
        const liveUrl =
            website?.deployURL || (website?.slug ? `${serverUrl}/api/website/live/${website.slug}` : "");

        if (!liveUrl) {
            setDeployError("Live URL is not available yet. Please deploy first.");
            return;
        }

        window.open(liveUrl, "_blank", "noopener,noreferrer");
    };

    useEffect(() => {
        if (!updateLoading) return;

        let index = 1;
        const interval = setInterval(() => {
            setMessage((m) => {
                const updated = [...m];
                for (let i = updated.length - 1; i >= 0; i--) {
                    if (updated[i]?.pending) {
                        updated[i] = {
                            ...updated[i],
                            content: thinkingStep[index] || updated[i].content
                        };
                        break;
                    }
                }
                return updated;
            });

            index = (index + 1) % thinkingStep.length;
        }, 1000);

        return () => clearInterval(interval);
    }, [updateLoading]);

    // 🔥 Fetch Website
    useEffect(() => {
        const loadModelConfig = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/ai/model-config`);
                const models = response?.data?.models;
                const apiCodingModels = models?.codingModels;

                if (Array.isArray(apiCodingModels) && apiCodingModels.length > 0) {
                    setCodingModels(apiCodingModels);
                    const defaultModel = models?.defaults?.codingModel || apiCodingModels[0].id;
                    setSelectedModel(defaultModel);
                    const selected = apiCodingModels.find((model) => model.id === defaultModel) || apiCodingModels[0];
                    setMaxTokens(getTokenBounds(selected).def);
                }
            } catch (error) {
                console.error('Failed to load model config:', error);
            }
        };

        loadModelConfig();
    }, []);

    useEffect(() => {
        const selected = codingModels.find((model) => model.id === selectedModel);
        if (!selected) return;
        const bounds = getTokenBounds(selected);
        setMaxTokens((prev) => Math.max(bounds.min, Math.min(bounds.max, prev || bounds.def)));
    }, [selectedModel, codingModels]);

    useEffect(() => {
        const handlegetWebsite = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const res = await axios.get(
                    `${serverUrl}/api/website/get-by-id/${id}`,
                    { withCredentials: true }
                );

                setWebsite(res.data);
                setCode(res.data.latestCode);
                setMessage(res.data.conversation);

            } catch (error) {
                console.log("get website by id error", error);
                setErrorMessage(
                    error?.response?.data?.message ||
                    "Failed to load website"
                );
            } finally {
                setLoading(false);
            }
        };

        handlegetWebsite();
    }, [id]);

    // 🔥 Load Preview
    useEffect(() => {
        if (!iframeRef.current || !code) return;

        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        iframeRef.current.src = url;

        return () => URL.revokeObjectURL(url);
    }, [code]);

    // Loading UI
    if (loading) {
        return (
            <div className='min-h-screen bg-[#050505] text-white flex items-center justify-center'>
                Loading website...
            </div>
        );
    }

    // Error UI
    if (errorMessage) {
        return (
            <div className='min-h-screen bg-[#050505] text-red-400 flex items-center justify-center'>
                {errorMessage}
            </div>
        );
    }

    return (
        <div className='h-screen w-screen bg-[#050505] text-white flex flex-col overflow-hidden'>

            {/* Mobile Tabs */}
            <div className='md:hidden flex border-b border-white/10 bg-black/90 z-20'>
                <button
                    className={`flex-1 py-3 text-xs text-center ${mobileView === 'chat' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-400'}`}
                    onClick={() => setMobileView('chat')}
                >
                    <MessageCircle size={16} />
                    <div>Chat</div>
                </button>
                <button
                    className={`flex-1 py-3 text-xs text-center ${mobileView === 'preview' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-400'}`}
                    onClick={() => setMobileView('preview')}
                >
                    <Eye size={16} />
                    <div>Preview</div>
                </button>
                <button
                    className={`flex-1 py-3 text-xs text-center ${mobileView === 'code' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-400'}`}
                    onClick={() => setMobileView('code')}
                >
                    <Code size={16} />
                    <div>Code</div>
                </button>
            </div>

            {/* Desktop Layout */}
            <div className='hidden md:flex flex-1 overflow-hidden'>

                <aside className='w-[380px] flex flex-col border-r border-white/10 bg-[#1a1a1a]'>
                    <Header title={website?.title} onBack={() => navigate('/dashboard')} />
                    <div className='flex-1 min-h-0'>
                        <Chat
                            message={message}
                            prompt={prompt}
                            setPrompt={setPrompt}
                            handleUpdateWebsite={handleUpdateWebsite}
                            updateLoading={updateLoading}
                        />
                    </div>
                </aside>

                <div className='flex-1 flex flex-col min-w-0'>

                    <div className='h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80'>
                        <span className='text-xs text-zinc-400'>Live Preview</span>
                        <div className='flex gap-3 items-center'>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                disabled={updateLoading}
                                className='h-8 rounded-lg border border-white/10 bg-[#1a1a1a] px-2 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-cyan-500'
                            >
                                {codingModels.map((model) => (
                                    <option key={model.id} value={model.id}>{model.label}</option>
                                ))}
                            </select>
                            <input
                                type='number'
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(Number(e.target.value) || 0)}
                                disabled={updateLoading}
                                min={getTokenBounds(codingModels.find((model) => model.id === selectedModel)).min}
                                max={getTokenBounds(codingModels.find((model) => model.id === selectedModel)).max}
                                className='h-8 w-24 rounded-lg border border-white/10 bg-[#1a1a1a] px-2 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-cyan-500'
                                title='Max output tokens'
                            />
                            <button
                                className='flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed'
                                onClick={handleDeployWebsite}
                                disabled={deployLoading}
                            >
                                <Rocket size={14} />
                                {deployLoading ? 'Deploying...' : 'Deploy'}
                            </button>

                            {website?.deployed && (
                                <button
                                    className='flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-400/30 text-emerald-200 text-sm font-semibold hover:bg-emerald-500/10 transition'
                                    onClick={handleOpenLive}
                                >
                                    <ExternalLink size={14} />
                                    Open Live
                                </button>
                            )}

                            <button className='p-2 hover:bg-white/5 rounded' onClick={() => setShowCode(true)}>
                                <FileCode size={18} />
                            </button>

                            <button className='p-2 hover:bg-white/5 rounded' onClick={() => setShowFullPreview(true)}>
                                <LucideMonitor size={18} />
                            </button>
                        </div>
                    </div>

                    {(deployMessage || deployError) && (
                        <div
                            className={`px-4 py-2 text-xs border-b ${
                                deployError
                                    ? 'text-red-300 bg-red-500/10 border-red-400/20'
                                    : 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20'
                            }`}
                        >
                            {deployError || deployMessage}
                        </div>
                    )}

                    <div className='flex-1 min-h-0'>
                        <iframe
                            srcDoc={code}
                            sandbox='allow-scripts allow-forms allow-modals allow-popups'
                            className='w-full h-full bg-white'
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className='flex-1 md:hidden overflow-hidden'>
                {mobileView === 'chat' && (
                    <div className='flex flex-col h-full'>
                        <Header title={website?.title} onBack={() => navigate('/dashboard')} />
                        <div className='flex-1 min-h-0 overflow-hidden'>
                            <Chat
                                message={message}
                                prompt={prompt}
                                setPrompt={setPrompt}
                                handleUpdateWebsite={handleUpdateWebsite}
                                updateLoading={updateLoading}
                            />
                        </div>
                    </div>
                )}

                {mobileView === 'preview' && (
                    <div className='flex flex-col h-full'>
                        <div className='h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80'>
                            <div className='flex items-center gap-2'>
                                <span className='text-xs text-zinc-400'>Live Preview</span>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={updateLoading}
                                    className='h-6 rounded border border-white/10 bg-[#1a1a1a] px-1 text-[10px] text-zinc-200 outline-none'
                                >
                                    {codingModels.map((model) => (
                                        <option key={model.id} value={model.id}>{model.label}</option>
                                    ))}
                                </select>
                                <input
                                    type='number'
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(Number(e.target.value) || 0)}
                                    disabled={updateLoading}
                                    min={getTokenBounds(codingModels.find((model) => model.id === selectedModel)).min}
                                    max={getTokenBounds(codingModels.find((model) => model.id === selectedModel)).max}
                                    className='h-6 w-20 rounded border border-white/10 bg-[#1a1a1a] px-1 text-[10px] text-zinc-200 outline-none'
                                />
                            </div>
                            <button className='p-2 hover:bg-white/5 rounded' onClick={() => setShowFullPreview(true)}>
                                <LucideMonitor size={18} />
                            </button>
                        </div>
                        {(deployMessage || deployError) && (
                            <div
                                className={`px-4 py-2 text-xs border-b ${
                                    deployError
                                        ? 'text-red-300 bg-red-500/10 border-red-400/20'
                                        : 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20'
                                }`}
                            >
                                {deployError || deployMessage}
                            </div>
                        )}
                        <div className='flex-1 min-h-0'>
                            <iframe
                                srcDoc={code}
                                sandbox='allow-scripts allow-forms allow-modals allow-popups'
                                className='w-full h-full bg-white'
                            />
                        </div>
                    </div>
                )}

                {mobileView === 'code' && (
                    <div className='flex flex-col h-full'>
                        <div className='h-14 px-4 flex items-center justify-between border-b border-white/10 bg-black/80'>
                            <span className='text-sm font-medium'>index.html</span>
                        </div>
                        <div className='flex-1 min-h-0 bg-[#1a1a1a]'>
                            <Editor
                                height='100%'
                                defaultLanguage='html'
                                theme='vs-dark'
                                value={code}
                                options={{
                                    readOnly: false,
                                    wordWrap: 'on',
                                    minimap: { enabled: false }
                                }}
                                onChange={(value) => setCode(value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showCode && (<motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[80vh] bg-[#1a1a1a] border border-white/10 rounded-lg p-6 overflow-auto z-50'
                >
                    <div className='h-12 px-4 justify-between flex items-center gap-3 mb-4 border-b border-white/10 bg-[#1e1e1e]'>
                        <span className='text-sm font-medium'>index.html</span>
                        <button onClick={() => setShowCode(false)}><X size={18} /></button>

                    </div>
                    <Editor
                        height="calc(80vh - 90px)"
                        defaultLanguage="html"
                        theme="vs-dark"
                        value={code}
                        options={{
                            readOnly: false,
                            wordWrap: "on",
                            minimap: { enabled: false }
                        }}
                        onChange={(value) => setCode(value)}
                    />

                </motion.div>)}
            </AnimatePresence>

            <AnimatePresence>
                {showFullPreview && (<motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    className='fixed inset-0 w-screen h-screen bg-[#1a1a1a] z-50 flex flex-col'
                >
                    <div className='h-12 px-4 justify-between flex items-center gap-3 border-b border-white/10 bg-[#1e1e1e]'>
                        <span className='text-sm font-medium'>Live Preview</span>
                        <button onClick={() => setShowFullPreview(false)}><X size={18} /></button>

                    </div>
                    <iframe
                        srcDoc={code}
                        sandbox='allow-scripts allow-forms allow-modals allow-popups'
                        className='w-full flex-1 bg-white'
                    />
                </motion.div>)}
            </AnimatePresence>
        </div>
    );
}

export default WebsiteEditor;


// ✅ Header Component (OUTSIDE)
function Header({ title, onBack }) {
    return (
        <div className='h-14 px-4 flex items-center justify-between border-b border-white/10 bg-[#1a1a1a]'>
            <button onClick={onBack} className='p-2 rounded-md hover:bg-white/10'>
                <ArrowLeft size={18} />
            </button>
            <span className='font-semibold truncate text-sm'>
                {title || 'Editor'}
            </span>
            <span className='w-8' />
        </div>
    );
}


// ✅ Chat Component (OUTSIDE — FIXED ISSUE)
function Chat({ message, prompt, setPrompt, handleUpdateWebsite, updateLoading }) {
    return (
        <div className='flex flex-col h-full'>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4 flex flex-col'>
                {message?.map((item, index) => (
                    <div
                        key={index}
                        className={`max-w-[85%] ${item.role === "user"
                                ? "self-end"
                                : "self-start"
                            }`}
                    >
                        <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${item.role === "user"
                                    ? "bg-white text-black"
                                    : "bg-white/5 border border-white/10 text-zinc-200"
                                }`}
                        >
                            {item.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className='p-3 border-t border-white/10'>
                <div className='flex gap-2'>
                    <input
                        placeholder='Describe changes ...'
                        className='flex-1 rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none'
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />

                    <button
                        className='px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-60 disabled:cursor-not-allowed'
                        onClick={handleUpdateWebsite}
                        disabled={updateLoading}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

        </div>
    );
}   
