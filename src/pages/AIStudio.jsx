import React, { useEffect, useRef, useState } from 'react';
import { serverUrl } from '../config/api';
import {
  Sparkles,
  Copy,
  Download,
  Check,
  Loader,
  Send,
  Trash2,
  StopCircle,
  Menu,
  X,
  ImageIcon,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageBackgroundVideo from '../components/PageBackgroundVideo';

void motion;

const FALLBACK_CHAT_MODELS = [
  { id: 'auto', label: 'Auto (Best from CROMP Config)' },
  { id: 'openrouter/free', label: 'OpenRouter Free (Auto)' },
  { id: 'openai/gpt-oss-120b:free', label: 'GPT-OSS 120B Free' },
  { id: 'mistral/codestral-latest', label: 'Mistral Codestral' },
  { id: 'mistral/magistral-medium-latest', label: 'Mistral Magistral Medium' },
  { id: 'mistral/mistral-small-latest', label: 'Mistral Small Latest' },
  { id: 'gemini/gemma-4-26b-a4b-it', label: 'Google Gemma-4 26B' }
];

const DEFAULT_CHAT_MODEL = 'auto';

const getModelTokenBounds = (model) => ({
  min: Number(model?.minMaxTokens) || 512,
  max: Number(model?.maxMaxTokens) || 8192,
  def: Number(model?.defaultMaxTokens) || 4096
});

const getAssistantGreeting = (modelId, modelList = FALLBACK_CHAT_MODELS) => {
  const modelLabel = modelList.find((model) => model.id === modelId)?.label || modelId;
  return `Hello! I'm your AI assistant powered by ${modelLabel}. Ask me anything - I can help with coding, writing, analysis, questions, and more. How can I assist you today?`;
};

const stripMarkdownInline = (text = '') => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .trimEnd();
};

const MessageContent = ({ content, onCopy, onDownload }) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2]
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <div key={index} className="relative group rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-[#1e1e2e] px-4 py-2 text-xs">
                <span className="text-cyan-400 font-mono">{part.language}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onCopy(part.content)}
                    className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition"
                    title="Copy code"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => onDownload(part.content, `code-${index}.${part.language === 'javascript' ? 'js' : 'txt'}`)}
                    className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition"
                    title="Download code"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
              <pre className="bg-[#1e1e2e] p-4 overflow-x-auto">
                <code className="text-sm font-mono text-gray-200">{part.content}</code>
              </pre>
            </div>
          );
        }

        return (
          <div key={index} className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
            {part.content.split('\n').map((line, i) => {
              if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
                const level = line.match(/^#+/)[0].length;
                const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
                return <Tag key={i} className={`font-bold ${level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'} mb-2`}>{stripMarkdownInline(line.replace(/^#+\s*/, ''))}</Tag>;
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={i} className="ml-4 text-gray-300">{stripMarkdownInline(line.replace(/^[*-]\s*/, ''))}</li>;
              }
              if (/^\d+\.\s/.test(line)) {
                return <li key={i} className="ml-4 text-gray-300 list-decimal">{stripMarkdownInline(line.replace(/^\d+\.\s*/, ''))}</li>;
              }
              if (line.startsWith('```')) {
                return null;
              }
              return <p key={i} className="mb-1">{stripMarkdownInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

const AIStudio = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: getAssistantGreeting(DEFAULT_CHAT_MODEL, FALLBACK_CHAT_MODELS),
      timestamp: Date.now()
    }
  ]);
  const [chatModels, setChatModels] = useState(FALLBACK_CHAT_MODELS);
  const [selectedChatModel, setSelectedChatModel] = useState(DEFAULT_CHAT_MODEL);
  const [chatMaxTokens, setChatMaxTokens] = useState(4096);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [abortController, setAbortController] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!userData) navigate('/auth');
  }, [userData, navigate]);

  useEffect(() => {
    const loadModelConfig = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/ai/model-config`);
        const data = await response.json();
        const apiModels = data?.models?.chatModels;

        if (Array.isArray(apiModels) && apiModels.length > 0) {
          setChatModels(apiModels);
          const defaultModel = data?.models?.defaults?.chatModel || apiModels[0].id;
          setSelectedChatModel(defaultModel);
          const selected = apiModels.find((model) => model.id === defaultModel) || apiModels[0];
          setChatMaxTokens(getModelTokenBounds(selected).def);
          setMessages([
            {
              role: 'assistant',
              content: getAssistantGreeting(defaultModel, apiModels),
              timestamp: Date.now()
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to load model config:', error);
      }
    };

    loadModelConfig();
  }, []);

  useEffect(() => {
    const selectedModelConfig = chatModels.find((model) => model.id === selectedChatModel);
    if (!selectedModelConfig) return;
    const bounds = getModelTokenBounds(selectedModelConfig);
    setChatMaxTokens((prev) => Math.max(bounds.min, Math.min(bounds.max, prev || bounds.def)));
  }, [selectedChatModel, chatModels]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    const userMsg = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setStreamingContent('');

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(`${serverUrl}/api/ai/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant. Provide clear, detailed responses in plain text. Avoid markdown bold/italic markers like ** and * unless the user explicitly asks for markdown. When providing code, use proper fenced code blocks with syntax highlighting.' },
            ...messages,
            userMsg
          ],
          model: selectedChatModel,
          maxTokens: chatMaxTokens
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedContent += data.content;
                setStreamingContent(accumulatedContent);
              } else if (data.done) {
                break;
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: accumulatedContent,
        timestamp: Date.now()
      }]);

    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: streamingContent || 'Response generation stopped.',
          timestamp: Date.now()
        }]);
      } else {
        console.error('Chat error:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${error.message}`,
          timestamp: Date.now()
        }]);
      }
    } finally {
      setLoading(false);
      setStreamingContent('');
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: getAssistantGreeting(selectedChatModel, chatModels),
      timestamp: Date.now()
    }]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content, filename) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative isolate h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <PageBackgroundVideo src='/videos/image%204.mp4' overlayClass='bg-[#0a0a0f]/62' videoClass='opacity-40' />
      <div className="relative z-10 flex h-screen">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 rounded-lg"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(showSidebar || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`fixed md:relative z-40 md:z-auto w-64 md:w-64 h-full bg-[#0f0f14] border-r border-white/5 flex flex-col ${showSidebar ? 'left-0' : '-left-64 md:left-0'}`}
          >
            <div className="p-4 border-b border-white/5">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
              >
                <Menu size={18} />
                Back to Dashboard
              </button>
            </div>

            <div className="p-4">
              <button
                onClick={() => navigate('/image-studio')}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition bg-white/5 text-gray-300 hover:bg-white/10`}
              >
                <ImageIcon size={16} />
                Go to Image Studio
              </button>
            </div>

            <div className="flex-1" />

            <div className="p-4 border-t border-white/5">
              <button
                onClick={handleClearChat}
                className="flex items-center gap-2 w-full py-2 px-3 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 transition"
              >
                <Trash2 size={16} />
                Clear Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-white/5 bg-[#0f0f14]/80 backdrop-blur flex items-center justify-center px-4">
          <div className="flex items-center gap-2 w-full max-w-4xl justify-between">
            <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={20} />
            <h1 className="text-lg font-semibold">AI Studio</h1>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">Chat + Coding</span>
            </div>
            <select
              value={selectedChatModel}
              onChange={(e) => setSelectedChatModel(e.target.value)}
              disabled={loading}
              className="h-8 rounded-lg border border-white/10 bg-[#11121a] px-2 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {chatModels.map((model) => (
                <option key={model.id} value={model.id}>{model.label}</option>
              ))}
            </select>
            <input
              type="number"
              value={chatMaxTokens}
              onChange={(e) => setChatMaxTokens(Number(e.target.value) || 0)}
              disabled={loading}
              min={getModelTokenBounds(chatModels.find((model) => model.id === selectedChatModel)).min}
              max={getModelTokenBounds(chatModels.find((model) => model.id === selectedChatModel)).max}
              className="h-8 w-24 rounded-lg border border-white/10 bg-[#11121a] px-2 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-cyan-500"
              title="Max output tokens"
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' ? 'bg-white text-black' : 'bg-gradient-to-br from-cyan-500 to-blue-500'
              }`}>
                {message.role === 'user' ? (
                  <span className="text-sm font-bold">U</span>
                ) : (
                  <Sparkles size={14} />
                )}
              </div>
              
              <div className={`max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                {message.role === 'user' ? (
                  <div className="bg-white text-black px-4 py-3 rounded-2xl rounded-tr-sm text-sm">
                    {message.content}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4">
                    <MessageContent 
                      content={message.content} 
                      onCopy={copyToClipboard}
                      onDownload={downloadFile}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Streaming Content */}
          {streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} />
              </div>
              <div className="max-w-[85%] md:max-w-[75%]">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4">
                  <MessageContent 
                    content={streamingContent} 
                    onCopy={copyToClipboard}
                    onDownload={downloadFile}
                  />
                  <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
                    <Loader size={12} className="animate-spin" />
                    Generating...
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-[#0f0f14]">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message AI Studio..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 resize-none"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '200px' }}
                disabled={loading}
              />
              
              <div className="absolute right-2 bottom-2 flex gap-2">
                {loading ? (
                  <button
                    onClick={handleStopGeneration}
                    className="p-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                    title="Stop generating"
                  >
                    <StopCircle size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="p-2.5 rounded-lg bg-cyan-500 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 transition"
                  >
                    <Send size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-center text-xs text-gray-600 mt-2">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      </div>
    </div>
  );
};

export default AIStudio;
