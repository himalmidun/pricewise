"use client"

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { getProductTitles } from '@/lib/actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import axios from 'axios'
import Tooltip from '@/components/Tooltip'

interface Props {
  productTitle: string,
  productId: string,
}

interface NavSearchProps {
  titles: Props[];
}

const NavSearch = ({ titles }: NavSearchProps) => {

  const [isOptionVisible, setIsOptionVisible] = useState(false);
  // console.log('Titlesss: ', titles);
  const [filteredTitles, setFilteredTitles] = useState<Props[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsOptionVisible(false);
      }
    }, 100);
  }

  const handleChange = (inputText: string) => {
    // console.log(inputText);
    if (inputText) {
      const filtered = titles.filter((item: any) => item.productTitle.toLowerCase().includes(inputText.toLowerCase()));
      setFilteredTitles(filtered);
      // console.log(filteredTitles);
    }
    else {
      setFilteredTitles([]);
    }
  }

  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await axios.get('https://pricewise-like-count.123kingkim.workers.dev');
        setLikes(response.data.likes);
      } catch (error) {
        console.log('Error fetching likes count: ', error);
      }
    }

    fetchLikes();
  }, [])

  const handleLikeClick = async () => {
    try {

      const response = await axios.post('https://pricewise-like-count.123kingkim.workers.dev')
      setLikes(response.data.likes);

    } catch (error) {
      console.log('Error handling like click: ', error);
    }
  }

  return (
    <div className='flex items-center gap-5'>
      <div className='ml-10 relative' >
        <input ref={inputRef} type="text" className=' z-10 relative flex-1 w-9 h-9 text-sm p-2 pl-8 font-normal border border-gray-500 rounded-full
            focus:w-full focus:min-w-12 focus:pl-10 transition-all duration-100 ease-linear' placeholder='searching...'
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsOptionVisible(true)}
          onBlur={handleBlur}
        />
        <div ref={dropdownRef} className={`z-10 absolute w-56 max-h-21 lg:ml-3 sm:ml-0 overflow-y-scroll rounded-md bg-gray-100 pointer-events-auto ${isOptionVisible ? 'block' : 'hidden'}`} >
          {filteredTitles.length > 0 && (
            filteredTitles.map((filtered) => (
              <Link key={filtered.productId} onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                setIsOptionVisible(false);
              }} href={`/products/${filtered.productId}`}>
                <div className='cursor-pointer py-3 px-3 hover:bg-slate-300'>
                  <p className='text-sm font-medium text-gray-600' >{filtered.productTitle.slice(0, 50)}</p>
                </div>
              </Link>
            ))
          )}

        </div>
        <div className='absolute z-20 inset-y-0 my-1.5 px-2 pointer-events-none'>
          <Image src='/assets/icons/search.svg'
            alt='search button'
            width={28}
            height={28}
            className='object-contain'
          />
        </div>
      </div>


      <div className='flex flex-shrink-0'>
        <button onClick={handleLikeClick}>
          <Image
            src='/assets/icons/black-heart.svg'
            alt='heart'
            width={28}
            height={28}
            className='object-contain'
          />
        </button>
        <span className='text-sm text-black font-normal'>{likes}</span>
      </div>

      <div className='flex flex-shrink-0'>

        <Tooltip text="Developer's Contact">
          <Link href='https://www.linkedin.com/in/himal-midun/' target='_blank'>
          <Image
            src='/assets/icons/user.svg'
            alt='user'
            width={28}
            height={28}
            className='object-contain'
          />
          </Link>
        </Tooltip>
      </div>

    </div>
  )
}

export default NavSearch