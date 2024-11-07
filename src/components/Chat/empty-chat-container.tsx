'use client'
import React, { useEffect, useState } from 'react'
import Lottie from 'react-lottie'
import { animationDefaultOption } from '@/lib/utils'

function Emptychatcontainer() {
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className='flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all'>
      {isClient && (
        <>
          <Lottie isClickToPauseDisabled={true} height={200} width={200} options={animationDefaultOption} />
          <div className='text-white/80 flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center'>
            <h3>
              Hi <span className='text-purple-500'>!</span> Welcome to
              <span className='text-purple-500'> Freely </span>Chat App<span className='text-purple-500'>.</span>
            </h3>
          </div>
        </>
      )}
    </div>
  )
}

export default Emptychatcontainer
