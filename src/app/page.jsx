"use client";
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ✅ ฟังก์ชันล้าง Markdown ลิงก์ที่ label = URL
const cleanMarkdownLinks = (text) => {
  return text.replace(/\[(https?:\/\/[^\]]+)\]\(\1\)/g, '[ดูรายละเอียดเพิ่มเติม]($1)');
};

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');

  const typeMessage = (message) => {
    return new Promise((resolve) => {
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index <= message.length) {
          setTypingMessage(message.slice(0, index));
          index++;
        } else {
          clearInterval(typingInterval);
          resolve();
        }
      }, 20);
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const currentInput = input;
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: currentInput }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentInput }),
      });

      if (!res.ok) {
        let errorData = { message: 'Error fetching response from API' };
        try {
            errorData = await res.json();
        } catch (jsonError) {}
        throw new Error(errorData.error || errorData.message || 'Error fetching response from API');
      }

      const data = await res.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'bot', content: data.answer },
      ]);

      await typeMessage(data.answer);

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          content: data.answer
        };
        return updatedMessages;
      });

      setTypingMessage('');
    } catch (error) {
      const errorMessage = `ขออภัย เกิดข้อผิดพลาด: ${error.message}`;

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'bot', content: errorMessage },
      ]);

      await typeMessage(errorMessage);

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          content: errorMessage
        };
        return updatedMessages;
      });

      setTypingMessage('');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#232323] overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 bg-white rounded-tl-2xl text-black flex flex-col">
        <div className="bg-[#A73B24] text-white px-8 py-5 rounded-tl-2xl text-lg font-semibold flex items-center justify-between w-full m-0 p-0">
          <span>Chat Helper</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto"> 
          <div className="mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-center ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
              >
                {msg.role === 'bot' && (
                  <img
                    src="ENG_KKU_Symbol.svg"
                    alt="Bot Avatar"
                    className="w-13 h-13 mr-2 rounded-full"
                  />
                )}
                <div 
                  className={`max-w-[70%] p-3 rounded-lg text-base sm:text-lg break-words whitespace-pre-wrap overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {children}
                        </a>
                      )
                    }}
                  >
                    {cleanMarkdownLinks(
                      msg.role === 'bot' && loading && idx === messages.length - 1
                        ? typingMessage
                        : msg.content
                    )}
                  </ReactMarkdown>
                </div>
                {msg.role === 'user' && (
                  <img
                    src="chat-centered-text-thin-svgrepo-com.svg"
                    alt="User Avatar"
                    className="w-10 h-10 ml-2 rounded-full"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 flex items-center justify-center space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask a question"
            className="w-250 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              resize: 'none',
            }}
            rows={input.split('\n').length || 1}
          />
          <button
            onClick={sendMessage}
            className="bg-[#E44E36] text-white p-2 rounded hover:bg-red-600"
            disabled={loading}
          >
            {loading ? (
              <img 
                src="Vector.svg" 
                alt="SVG Icon" 
                className="w-6 h-6"
              />
            ) : (
              <span className="flex items-center">
                <img 
                  src="Vector.svg" 
                  alt="SVG Icon" 
                  className="w-6 h-6"
                />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
