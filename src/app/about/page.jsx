import React from 'react'
import Sidebar from '../components/Sidebar'

function Page() {
  return (
    <div className="flex min-h-screen bg-[#232323]">
      <Sidebar />
      
      <div className="flex-1 bg-white rounded-tl-2xl text-black flex flex-col">
        <div className="bg-[#A73B24] text-white px-8 py-5 rounded-tl-2xl text-lg font-semibold flex items-center justify-between w-full">
          <span>About Us</span>
        </div>
        {/* ที่นี่สามารถใส่เนื้อหาเพิ่มเติมได้  */}
      </div>
    </div> 
  );
}

export default Page
