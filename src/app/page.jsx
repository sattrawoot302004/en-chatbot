"use client";
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const cleanMarkdownLinks = (text) => {
  if (!text) return ''; // Add null check
  return text.replace(/\[(https?:\/\/[^\]]+)\]\(\1\)/g, '[ดูรายละเอียดเพิ่มเติม]($1)');
};

export default function Home() {
  // Update message state structure to potentially include an 'image' field
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
    setTypingMessage(''); // Reset typing message immediately

    try {
      // IMPORTANT: Ensure this matches your API route path
      const res = await fetch('/api/chat', { // Changed from /api/chat
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentInput }),
      });

      if (!res.ok) {
        let errorData = { message: 'Error fetching response from API' };
        try {
            errorData = await res.json();
        } catch (jsonError) {}
        throw new Error(errorData.error || errorData.message || `API Error: ${res.statusText}`);
      }

      const data = await res.json();

      // Create the initial bot message object including the image property
      const botMessage = {
        role: 'bot',
        content: '', // Start with empty content for typing effect
        image: data.image // Store the image URL/filename
      };

      // Add the placeholder message immediately
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Start typing effect for the answer
      await typeMessage(data.answer);

      // Update the last message (the bot message) with the final content
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;
        if (updatedMessages[lastMessageIndex] && updatedMessages[lastMessageIndex].role === 'bot') {
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex], // Keep role and image
            content: data.answer // Set the final content
          };
        }
        return updatedMessages;
      });

      setTypingMessage(''); // Clear typing message after completion

    } catch (error) {
      console.error("Send message error:", error); // Log the actual error
      const errorMessageContent = `ขออภัย เกิดข้อผิดพลาด: ${error.message}`;

       // Create the error bot message object
      const errorBotMessage = {
        role: 'bot',
        content: '', // Start with empty content for typing effect
        image: "Not use any image." // No image for errors
      };

      // Add the placeholder error message
      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);

      // Start typing effect for the error message
      await typeMessage(errorMessageContent);

      // Update the last message (the error bot message) with the final content
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;
         if (updatedMessages[lastMessageIndex] && updatedMessages[lastMessageIndex].role === 'bot') {
            updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex], // Keep role and image
                content: errorMessageContent // Set the final error content
            };
         }
        return updatedMessages;
      });

      setTypingMessage(''); // Clear typing message after completion

    } finally { // Use finally to ensure loading is set to false
        setLoading(false);
    }
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
            {messages.map((msg, idx) => {
              // Determine content: use typing message only for the very last bot message *during* loading
              const isLastBotMessage = msg.role === 'bot' && idx === messages.length - 1;
              const displayContent = isLastBotMessage && loading ? typingMessage : msg.content;

              return (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start justify-start'} mb-4`} // Use items-start for bot
                >
                  {/* Bot Avatar */}
                  {msg.role === 'bot' && (
                    <img
                      src="/ENG_KKU_Symbol.svg" // Assuming it's in public folder
                      alt="Bot Avatar"
                      className="w-10 h-10 mr-3 rounded-full flex-shrink-0" // Adjusted size/margin
                    />
                  )}

                                    {/* Message Bubble */}
                                    <div
                    className={`max-w-[70%] p-3 rounded-lg text-base sm:text-lg break-words ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    {/* Markdown Content - INCORRECT USAGE */}
                    {/* <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          />
                        ),
                      }}
                      className="prose prose-sm sm:prose-base max-w-none" // <--- THIS CAUSES THE ERROR
                    >
                      {cleanMarkdownLinks(displayContent)}
                    </ReactMarkdown> */}


                    {/* --- CORRECTED USAGE --- */}
                    {/* Add a wrapper div and move the className here */}
                    <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert"> {/* Added dark:prose-invert for potential dark mode */}
                       <ReactMarkdown
                         remarkPlugins={[remarkGfm]}
                         components={{
                           // Your custom 'a' component is fine here
                           a: ({ node, ...props }) => (
                             <a
                               {...props}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-blue-600 hover:text-blue-800 underline break-all" // ClassName inside components is okay
                             />
                           ),
                           // You can add more overrides if needed, e.g., for paragraphs:
                           // p: ({node, ...props}) => <p className="mb-2" {...props} />,
                         }}
                         // No className here anymore!
                       >
                         {cleanMarkdownLinks(displayContent)}
                       </ReactMarkdown>
                    </div>
                    {/* --- END CORRECTED USAGE --- */}


                    {/* Conditional Image Rendering (remains the same) */}
                    {msg.role === 'bot' && msg.image && msg.image !== "Not use any image." && !loading && (
                      <div className="mt-3">
                        <img
                          src={`/${msg.image}`}
                          alt="Related content"
                          className="max-w-full h-auto rounded-md border border-gray-300"
                        />
                      </div>
                    )}
                     {msg.role === 'bot' && msg.image && msg.image !== "Not use any image." && loading && isLastBotMessage && (
                       <div className="mt-3 text-sm text-gray-500 italic">
                          (ภาพจะปรากฏหลังข้อความเสร็จสิ้น / Image will appear after text completion)
                       </div>
                     )}

                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <img
                      src="/chat-centered-text-thin-svgrepo-com.svg" // Assuming it's in public folder
                      alt="User Avatar"
                      className="w-10 h-10 ml-3 rounded-full flex-shrink-0" // Adjusted size/margin
                    />
                  )}
                </div>
              );
            })}
             {/* Display typing indicator separately if needed */}
             {/* {loading && typingMessage && messages[messages.length - 1]?.role === 'bot' && (
                // You could add a dedicated typing indicator bubble here if preferred
             )} */}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-center space-x-2"> {/* Added border */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="ถามคำถามที่นี่..." // Changed placeholder
            className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" // Use flex-1, resize-none
            rows={Math.min(5, input.split('\n').length || 1)} // Limit rows growth
            style={{
                overflowY: input.split('\n').length > 5 ? 'auto' : 'hidden' // Add scroll for more lines
             }}
          />
          <button
            onClick={sendMessage}
            className="bg-[#E44E36] text-white p-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-10" // Fixed size, center icon
            disabled={loading || input.trim() === ''} // Disable also if input is empty
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
            ) : (
              <img
                  src="/Vector.svg" // Assuming it's in public folder
                  alt="Send"
                  className="w-6 h-6"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}