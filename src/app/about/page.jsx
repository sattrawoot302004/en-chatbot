import React from 'react'
import Image from 'next/image'
import Sidebar from '../components/Sidebar'

function Page() {
  const teamMembers = [
    {name : 'Nutsaba Chaiyadet', id: '653040134-6' , image : '/images/imm.png'},
    {name : 'Sattrawoot Parnemeng', id: '653040144-3', image : '/images/diamond.png'},
    { name: 'Achira Artnaseaw', id: '653040147-7', image : '/images/kati.png' },
    { name: 'Korapart Lertwittayakul', id: '653040436-0',image : '/images/fah.png' },
    { name: 'Raktapa Chaenglew', id: '653040459-8',image : '/images/vs.png' },
    { name: 'Ganpapath Pheephokinanan', id: '653040618-4', image : '/images/opal.png' }
  ];
  return (
    <div className="flex min-h-screen bg-[#232323]">
      <Sidebar />
      
      <div className="flex-1 bg-white rounded-tl-2xl text-black flex flex-col">
        <div className="bg-[#A73B24] text-white px-8 py-5 rounded-tl-2xl text-lg font-semibold flex items-center justify-between w-full">
          <span>About Us</span>
        </div>
        
        <div className='p-8'>
          <div className='grid grid-cols-3 gap-6'>
            {teamMembers.map((member, index) => (
              <div key={index} className='bg-[#3A4149] rounded-2xl p-6 flex flex-col items-center shadow-lg transform transition-all hover:scale-105 hover:shadow-xl'>
                {/* <div className='w-24 h-24 bg-gray-500 rounded-full mb-4'></div>
                <p className='text-gray-900 text-center'>{member.name}</p>
                <p className='text-gray-400 text-sm'>{member.id}</p> */}
                {/* <div className="w-32 h-32 bg-gray-600 rounded-full mb-5 flex items-center justify-center">
                  <span className="text-white text-4xl">👤</span>
                </div> */}
                <div className="w-32 h-32 mb-5 relative">
                  <Image 
                    src={member.image} 
                    alt={`${member.name} profile`}
                    width={128}
                    height={128}
                    className="rounded-full object-cover"
                    // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-lg mb-1">{member.name}</p>
                  <p className="text-gray-400 text-sm">{member.id}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='text-center text-gray-600 mt-8 p-6'>
            <p>คณะวิศวกรรมศาสตร์</p>
            <p>สาขาวิศวกรรมคอมพิวเตอร์ รุ่นที่ 32</p>
            <p>มหาวิทยาลัยขอนแก่น</p>
          </div>
        </div>
      </div>
    </div> 
  );
}

export default Page
