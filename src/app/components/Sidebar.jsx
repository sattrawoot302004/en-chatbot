"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay สำหรับหน้าจอเล็ก */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed md:static z-50 w-80 bg-[#1E1E1E] p-6 flex flex-col justify-between h-screen 
        transition-transform duration-300 ease-in-out`}>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#A73B24]">EN -</h1>
              <h1 className='text-2xl md:text-3xl font-bold text-[#FFFFFF]'>Chatbot</h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white text-2xl"
              aria-label="Close sidebar"
            >
              &times;
            </button>
          </div>

          <nav className="space-y-4 mt-6">
            <Link href="/" onClick={() => setIsSidebarOpen(false)}>
              <button
                className={`w-full flex items-center px-4 py-2 rounded text-white ${pathname === '/' ? 'bg-[#33333D]' : 'hover:bg-[#33333D]'
                  }`}
              >
                <span className="mr-2">💬</span> Chat
              </button>
            </Link>
            <Link href="/about" onClick={() => setIsSidebarOpen(false)}>
              <button
                className={`w-full flex items-center px-4 py-2 rounded text-white ${pathname === '/about' ? 'bg-[#33333D]' : 'hover:bg-[#33333D]'
                  }`}
              >
                <span className="mr-2">❔</span> About us
              </button>
            </Link>
          </nav>
        </div>

        <div className="flex-grow flex justify-center items-center mt-40">
          <img
            src="KKUimage.svg"
            alt="KKU Logo"
            className="w-32 md:w-40"
          />
        </div>
      </aside>
    </>
  );
}

export default Sidebar;