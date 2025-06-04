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
        className="rounded-lg overflow-hidden aspect-square max-h-[50vh] sm:max-h-[60vh]"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="aspect-square">
            <img
              src={image}
              alt={`Vista ${index + 1}`}
              className="w-full h-full object-contain"
              onClick={() => onImageClick?.(image)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={8}
        slidesPerView="auto"
        watchSlidesProgress
        modules={[Navigation, Thumbs]}
        className="thumbs-swiper"
        breakpoints={{
          320: {
            slidesPerView: 4,
            spaceBetween: 4,
          },
          480: {
            slidesPerView: 4,
            spaceBetween: 6,
          },
          640: {
            slidesPerView: 4,
            spaceBetween: 8,
          }
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} style={{ width: 'auto' }}>
            <div className="aspect-square rounded-md overflow-hidden w-16 sm:w-20">
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