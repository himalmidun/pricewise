import Link from 'next/link'
import Image from 'next/image'
import NavSearch from '@/components/NavSearch'
import { getProductTitles } from '@/lib/actions'


const Navbar = async () => {
  const productTitles = await getProductTitles();
  return (
    <header className='w-full'>
      <nav className='nav'>
        <Link href="/" className='flex items-center gap-1'>
          <Image src="/assets/icons/logo.svg"
            width={28}
            height={28}
            alt="logo"
          />

          <p className='nav-logo'>
            Price<span className='text-primary'>Wise</span>
          </p>
        </Link>
        
        <NavSearch titles={productTitles} />
      </nav>
    </header >
  )
}

export default Navbar
