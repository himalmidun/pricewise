"use client"

import React from 'react'
import Image from 'next/image'

const navIcons = [
    // {src: '/assets/icons/search.svg', alt:'search'},
    { src: '/assets/icons/black-heart.svg', alt: 'heart' },
    { src: '/assets/icons/user.svg', alt: 'user' },
  ]

  
  const NavSearch = () => {

      const handleChange = (inputText: string) => {
        console.log(inputText);
      }
  return (
    <div className='flex items-center gap-5'>
          <div className='flex ml-10 relative'>


            <input type="text" className='z-10 relative flex-1 w-9 h-9 text-sm p-2 pl-8 font-normal border border-gray-500 rounded-full
            focus:w-full focus:min-w-12 focus:pl-10' placeholder='searching...'
            onChange={(e) => handleChange(e.target.value)} />

            <div className='absolute z-20 my-1.5 px-2 pointer-events-none'>

              <Image src='/assets/icons/search.svg'
                alt='search button'
                width={28}
                height={28}
                className='object-contain'
              />
            </div>
          </div>


          {navIcons.map((icon) => (
            <Image
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              width={28}
              height={28}
              className='object-contain'
            />
          ))}
        </div>
  )
}

export default NavSearch