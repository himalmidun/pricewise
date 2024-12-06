"use client"

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel'
import Image from "next/image";
import { getProductImages } from "@/lib/actions";
import { useEffect, useState } from "react";


const HeroCarousel = () => {
  // const [isLoading, setIsLoading] = useState(true);
  const [productImages, setProductImages] = useState<any[]>([]);
  
  const heroImages = [
    { imgUrl: '/assets/images/hero-1.svg', alt: 'smartwatch' },
    { imgUrl: '/assets/images/hero-2.svg', alt: 'bag' },
    { imgUrl: '/assets/images/hero-3.svg', alt: 'lamp' },
    { imgUrl: '/assets/images/hero-4.svg', alt: 'air fryer' },
    { imgUrl: '/assets/images/hero-5.svg', alt: 'chair' },
  ]
  
  
  // useEffect(() => {
  //   // Only execute the side-effect (fetching product images) when the component mounts
  //   const fetchData = async () => {
  //     try {
  //       const images = await getProductImages();
  //       setProductImages(images || []);
  //     } catch (error) {
  //       console.error("Error fetching product images:", error);
  //       setProductImages([]); // Handle the error, maybe set default images
  //     } finally {
  //       setIsLoading(false); // Set loading to false after fetching
  //     }
  //   };
  
  //   fetchData(); // Call the fetch function
  // }, []); // Empty dependency array ensures it runs only once after mount
  
  
  // const carouselImages = productImages.length > 0 ? productImages : heroImages;
  const carouselImages = heroImages;
  

  return (
    <div>
      {/* {isLoading ? (
        <div>Loading Images...</div>
      ) : ( */}
        <div className="hero-carousel">
          <Carousel showThumbs={false}
            autoPlay
            infiniteLoop
            interval={2000}
            showArrows={false}
            showStatus={false}>
            {carouselImages.map((image: any) => (
              <Image src={image.imgUrl}
                alt={image.alt}
                width={484}
                height={484}
                className="object-contain"
                key={image.alt}
              />
            ))}
          </Carousel>

          <Image src="assets/icons/hand-drawn-arrow.svg"
            alt="arrow"
            width={175}
            height={175}
            className="max-xl:hidden absolute -left-[15%] bottom-0 z-0"
          />
        </div>
      {/* )
      } */}
    </div>
  )
}

export default HeroCarousel
