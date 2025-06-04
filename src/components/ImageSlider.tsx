import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

interface ImageSliderProps {
  images: string[];
  onImageClick?: (imageUrl: string) => void;
}

const ImageSlider = ({ images, onImageClick }: ImageSliderProps) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  if (!images?.length) return null;

  return (
    <div className="space-y-2">
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        className="rounded-lg overflow-hidden aspect-square"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image}
              alt={`Vista ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onImageClick?.(image)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        watchSlidesProgress
        modules={[Navigation, Thumbs]}
        className="thumbs-swiper"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="aspect-square rounded-md overflow-hidden">
              <img
                src={image}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;