"use client";
import React from 'react';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';

function Page() {
  const teamMembers = [
    { name: 'Nutsaba Chaiyadet', id: '653040134-6', image: '/images/f1.jpg' },
    { name: 'Sattrawoot Parnemeng', id: '653040144-3', image: '/images/m1.jpg' },
    { name: 'Achira Artnaseaw', id: '653040147-7', image: '/images/m2.jpg' },
    { name: 'Korapart Lertwittayakul', id: '653040436-0', image: '/images/f2.jpg' },
    { name: 'Raktapa Chaenglew', id: '653040459-8', image: '/images/f3.jpg' },
    { name: 'Ganpapath Pheephokinanan', id: '653040618-4', image: '/images/f4.jpg' }
  ];

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

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
            <span>About Us</span>
          </div>
        </div>

        <div className="bg-white flex-1 overflow-y-auto p-6 rounded-b-2xl">
          <div className="max-w-4xl mx-auto">
            {/* แถวบน 3 คน */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {teamMembers.slice(0, 3).map((member, index) => (
                <SquareMemberCard key={index} member={member} />
              ))}
            </div>

            {/* เส้นคั่น */}
            <div className="border-t border-gray-300 my-6 w-3/4 mx-auto"></div>

            {/* แถวล่าง 3 คน */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {teamMembers.slice(3).map((member, index) => (
                <SquareMemberCard key={index + 3} member={member} />
              ))}
            </div>

            <div className='text-right mt-1 text-gray-600'><a href="http://www.freepik.com">Designed by Freepik</a></div>

            {/* ข้อมูลมหาวิทยาลัย */}
            <div className="mt-12 text-center">
              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-lg font-semibold mb-2">Khon Kaen University</h3>
                <div className="text-gray-600 space-y-1">
                  <p>คณะวิศวกรรมศาสตร์</p>
                  <p>สาขาวิศวกรรมคอมพิวเตอร์ รุ่นที่ 32</p>
                  <p>มหาวิทยาลัยขอนแก่น</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// คอมโพเนนต์การ์ดสมาชิกทีมแบบสี่เหลี่ยม (รูปเล็กลง กล่องเท่าเดิม)
function SquareMemberCard({ member }) {
  return (
    <div className="mt-9 bg-gray-100 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center relative">
      {/* กล่องรูปภาพที่มี padding */}
      <div className=" absolute -top-15 w-full p-4 flex justify-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg">
          <Image
            src={member.image}
            alt={`${member.name} profile`}
            fill
            className="object-cover scale-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
      <div className="text-center w-full mt-20">
        <h2 className="text-lg font-semibold mb-1">{member.name}</h2>
        <p className="text-gray-600">{member.id}</p>
      </div>
    </div>
  );
}

export default Page;