"use client";
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
const cleanMarkdownLinks = (text) => {
  if (!text) return '';
  return text.replace(/\[(https?:\/\/[^\]]+)\]\(\1\)/g, '[ดูรายละเอียดเพิ่มเติม]($1)');
};

const ensureProperListFormat = (text) => {
  if (!text) return '';
  let lines = text.split('\n');
  let formattedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^\d+\.?\s+.+/.test(line)) {
      const match = line.match(/^(\d+)\.?\s+(.+)/);
      if (match) {
        formattedLines.push(`${match[1]}. ${match[2]}`);
      } else {
        formattedLines.push(line);
      }
    } else {
      formattedLines.push(line);
    }
  }

  return formattedLines.join('\n');
};

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const currentInput = input;
    setMessages((prev) => [...prev, { role: 'user', content: currentInput }]);
    setInput('');
    setLoading(true);
    setTypingMessage('');

    setMessages((prev) => [...prev, { role: 'bot', content: '', image: null }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentInput }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const reader = response.body.getReader();
      let accumulatedContent = '';
      let selectedImage = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = new TextDecoder().decode(value);
        const jsonChunks = chunkText.split('\n').filter(part => part.trim());

        for (const jsonChunk of jsonChunks) {
          try {
            const data = JSON.parse(jsonChunk);

            if (data.type === 'metadata') {
              selectedImage = data.image;
              setMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].role === 'bot') {
                  updated[lastIndex] = { ...updated[lastIndex], image: selectedImage };
                }
                return updated;
              });
            }
            else if (data.type === 'chunk') {
              accumulatedContent += data.content;
              setTypingMessage(accumulatedContent);
              setMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].role === 'bot') {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: accumulatedContent,
                    image: selectedImage
                  };
                }
                return updated;
              });
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', image: null }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#232323]">
      {isSidebarOpen && (
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      )}

      <div className="bg-[#1E1E1E] p-3 flex-1 text-black flex flex-col h-screen">
        <div className="bg-[#A73B24] text-white px-8 py-4 text-xl font-semibold flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 text-white text-xl"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? '' : '☰'}
            </button>
            <span>Chat Helper</span>
          </div>
        </div>

        <div className="bg-white flex-1 overflow-y-auto p-2 md:p-4" style={{ height: 'calc(100vh - 160px)' }}>
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isLastBotMessage = msg.role === 'bot' && idx === messages.length - 1;
              const displayContent = msg.content;

              return (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <Image
                      src="/ENG_KKU_Symbol.svg"
                      alt="Bot Avatar"
                      width={24} height={24} 
                      className="w-8 h-8 md:w-10 md:h-10 mr-2 md:mr-3 rounded-full flex-shrink-0"
                    />
                  )}

                  <div
                    className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] p-3 rounded-lg text-sm sm:text-base md:text-lg break-words ${msg.role === 'user' ? 'bg-gray-200 text-black' : 'bg-gray-200 text-black'
                      }`}
                  >
                    <div className="prose prose-sm sm:prose-base max-w-none prose-ol:list-decimal prose-ul:list-disc">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all" />
                          ),
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
                          li: ({ node, ...props }) => <li className="ml-2 pl-0" {...props} />
                        }}
                      >
                        {ensureProperListFormat(cleanMarkdownLinks(displayContent))}
                      </ReactMarkdown>
                    </div>

                    {msg.role === 'bot' && msg.image && msg.image !== "Not use any image." && !loading && (
                      <div className="mt-2">
                        <Image
                          src={`/${msg.image}`}
                          alt="Related content"
                          width={400} height={300}
                          className="max-w-full h-auto rounded-md border border-gray-300"
                        />
                      </div>
                    )}
                    {msg.role === 'bot' && msg.image && msg.image !== "Not use any image." && loading && isLastBotMessage && (
                      <div className="mt-2 text-xs md:text-sm text-gray-500 italic">
                        (ภาพจะปรากฏหลังข้อความเสร็จสิ้น / Image will appear after text completion)
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <Image
                      src="/Profile.png"
                      alt="User Avatar"
                      width={24} height={24}
                      className="w-8 h-8 md:w-10 md:h-10 ml-2 md:ml-3 rounded-full flex-shrink-0"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-5 md:p-4 rounded-b-2xl">
          <div className="flex items-center space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="ถามคำถามที่นี่..."
              className="flex-1 border rounded-md px-3 py-2 md:px-4 md:py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm md:text-base"
              rows={Math.min(3, input.split('\n').length || 1)}
              style={{
                overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
              }}
            />
            <button
              onClick={sendMessage}
              className="bg-[#E44E36] text-white p-1 md:p-2 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10 h-9.5 md:w-12 md:h-10"
              disabled={loading || input.trim() === ''}
              aria-label="Send message"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Image
                  src="/Vector.svg"
                  alt="Send"
                  width={24} height={24}
                  className="w-4 h-4 md:w-6 md:h-6"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
