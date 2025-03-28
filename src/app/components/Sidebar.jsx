import React from 'react'
import Link from 'next/link'
function Sidebar() {
  return (
    <aside className="w-80 bg-[#1E1E1E] p-6 flex flex-col justify-between">
  <div>
    <h1 className="text-3xl font-bold text-[#A73B24] ">EN -<br /></h1>
    <h1 className='text-3xl font-bold text-[#FFFFFF] mb-10 '>Chatbot</h1>
    <nav className="space-y-4">
    <Link href="/">
      <button className="w-full flex items-center px-4 py-2 rounded hover:bg-[#33333D] text-white ">
        <span className="mr-2">💬</span> Chat
      </button>
      </Link>
      <Link href="/about">
      <button className="w-full flex items-center px-4 py-2 hover:bg-[#33333D] rounded text-white">
        <span className="mr-2">❔</span> About us
      </button>
      </Link>
    </nav>
  </div>

  {/* Div สำหรับโลโก้ */}
  <div className="flex-grow flex justify-center items-center mt-4">
    <img 
      src="KKUimage.svg" 
      alt="KKU Logo" 
      className="w-40"
    />
  </div>
</aside>

);
}

export default Sidebar