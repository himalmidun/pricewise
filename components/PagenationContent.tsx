"use client"
import React, { useEffect, useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import { getAllProducts } from '@/lib/actions';
import { Product } from '@/types';

interface ProductProps{
    products: Product[] | undefined,
}

const PagenationContent = ({products}: ProductProps) => {
    // const latestProducts = useMemo(() => {
    //     return products ? [...products].reverse() : [];
    // }, [products]);
    // const totalProducts = products?.length || 0;
    // const productsPerPage = 6;
    // const totalPages = Math.ceil(totalProducts/productsPerPage);
    // const [displayProducts, setDisplayProducts] = useState(latestProducts?.slice(0,6));
    // const [page, setPage] = useState(1);

    // useEffect(() => {
    //     if (!latestProducts || latestProducts.length === 0) return;
    //     const startIndex = (page-1) * productsPerPage;
    //     const endIndex = startIndex + productsPerPage;
    //     setDisplayProducts(latestProducts?.slice(startIndex, endIndex));
    // },  [page, latestProducts])

    console.log('inside pagenation');
    const productsPerPage = 6;
    const totalProducts = products?.length || 0;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
  
    const [page, setPage] = useState(1);
  
    // Reverse products only once
    const latestProducts = products ? [...products].reverse() : [];
  
    // Dynamically calculate displayProducts based on current page
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const displayProducts = latestProducts.slice(startIndex, endIndex);

  return (
    <div className='flex-col gap-5'>
    <div className="flex flex-wrap gap-x-8 gap-y-16">
      {displayProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
    </div>
    <div className='flex justify-around my-20'>
        <button onClick={()=> setPage(prevPage => Math.max(prevPage - 1, 1))} className={`searchbar-btn ${page==1?'disabled': ''}`}>Previous</button>
        <span className='text-black text-lg font-semibold'>{page} of {totalPages}</span>
        <button onClick={()=> setPage(prevPage => Math.min(prevPage + 1, totalPages))} className={`searchbar-btn ${page==totalPages?'disabled': ''}`}>Next</button>
    </div>
    </div>
  )
}

export default PagenationContent
