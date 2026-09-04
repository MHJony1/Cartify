"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Navigation } from 'swiper/modules';
import { Swiper as SwiperType } from 'swiper/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const AUTOPLAY_DELAY = 6000;

const SWIPER_MODULES = [EffectFade, Autoplay, Navigation];
const FADE_EFFECT = { crossFade: true };
const AUTOPLAY_CONFIG = {
  delay: AUTOPLAY_DELAY,
  disableOnInteraction: false,
};

export function HeroSection() {
  const swiperRef = useRef<SwiperType | null>(null);

  const handleSlideChange = (swiper: SwiperType) => {
    // Pause swiper autoplay when entering video slide
    if (swiper.realIndex === 1) {
      swiper.autoplay.stop();
    } else {
      swiper.autoplay.start();
    }
  };

  const handleVideoEnd = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.animating = false;
      swiperRef.current.allowSlideNext = true;
      swiperRef.current.allowSlidePrev = true;
      swiperRef.current.slideNext();
      swiperRef.current.autoplay.start();
    }
  }, []);

  return (
    <section className="relative w-full h-[calc(100dvh-110px)] min-h-[600px] mt-[110px] bg-background overflow-hidden group">
      <Swiper
        modules={SWIPER_MODULES}
        effect="fade"
        fadeEffect={FADE_EFFECT}
        speed={800}
        loop={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={handleSlideChange}
        autoplay={AUTOPLAY_CONFIG}
        className="w-full h-full absolute inset-0 bg-background"
      >
        {/* SLIDE 01 - MEN */}
        <SwiperSlide className="bg-background">
          <div className="relative w-full h-full bg-background">
            <Image
              src="/images/Cartify_hero_1.png"
              alt="Cartify Fashion Campaign"
              fill
              priority
              className="object-cover object-top"
            />
            <Link href="/categories/men" className="absolute inset-0 z-10 hover:bg-black/10 transition-colors duration-300" aria-label="Shop Men">
              <span className="sr-only">Shop Men</span>
            </Link>
            {/* Consistent HTML Content Block */}
            <div className="relative z-20 w-full max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex flex-col justify-center items-start pointer-events-none">
              <div className="max-w-xl pointer-events-auto">
                <div className="opacity-0 select-none" aria-hidden="true">
                  <p className="text-xs md:text-sm font-semibold tracking-[0.2em] text-white/90 uppercase mb-2 md:mb-3">
                    THE CARTIFY EDIT
                  </p>
                  <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white uppercase leading-[1.1] mb-3 md:mb-4">
                    ELEVATED<br />
                    <span className="font-semibold">ESSENTIALS</span>
                  </h2>
                  <p className="text-base md:text-lg text-white/90 font-light mb-4 md:mb-5 max-w-md">
                    Timeless pieces. Modern design. Crafted for the way you live.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* SLIDE 02 - VIDEO */}
        <SwiperSlide className="bg-black">
          {({ isActive }) => (
            <VideoSlideContent isActive={isActive} onEnded={handleVideoEnd} />
          )}
        </SwiperSlide>

        {/* SLIDE 03 - GRID */}
        <SwiperSlide className="bg-background">
          <div className="relative w-full h-full bg-background">
            <Image
              src="/images/Cartify_hero_2.png"
              alt="Cartify Collections Grid"
              fill
              className="object-cover object-top"
            />
            {/* Interactive Grid Map Overlay */}
            <div className="absolute inset-0 z-20">
              {/* MEN - Left Half */}
              <Link href="/categories/men" className="absolute top-0 left-0 w-[50%] h-[66.66%] hover:bg-black/10 transition-colors duration-300" aria-label="Shop Men's Collection" />
              {/* WOMEN - Top Right */}
              <Link href="/categories/women" className="absolute top-0 left-[50%] w-[50%] h-[33.33%] hover:bg-black/10 transition-colors duration-300" aria-label="Shop Women's Collection" />
              {/* KIDS - Mid Right */}
              <Link href="/categories/kids" className="absolute top-[33.33%] left-[50%] w-[50%] h-[33.33%] hover:bg-black/10 transition-colors duration-300" aria-label="Shop Kids Collection" />
              {/* ACCESSORIES - Bottom Left */}
              <Link href="/shop?search=accessories" className="absolute top-[66.66%] left-0 w-[33.33%] h-[33.33%] hover:bg-black/10 transition-colors duration-300" aria-label="Shop Accessories" />
              {/* NEW IN - Bottom Mid */}
              <Link href="/shop?sort=new" className="absolute top-[66.66%] left-[33.33%] w-[33.33%] h-[33.33%] hover:bg-black/10 transition-colors duration-300" aria-label="Shop New Arrivals" />
              {/* SALE - Bottom Right */}
              <Link href="/shop?sale=true" className="absolute top-[66.66%] left-[66.66%] w-[33.33%] h-[33.33%] hover:bg-black/10 transition-colors duration-300" aria-label="Shop Sale Items" />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      {/* CUSTOM CAROUSEL CONTROLS */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-12 z-40 flex items-center gap-2 pointer-events-auto drop-shadow-md">
        <button
          onClick={() => {
            if (swiperRef.current) {
              swiperRef.current.animating = false;
              swiperRef.current.allowSlidePrev = true;
              swiperRef.current.allowSlideNext = true;
              swiperRef.current.autoplay.stop();
              swiperRef.current.slidePrev();
            }
          }}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm cursor-pointer disabled:opacity-50"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => {
            if (swiperRef.current) {
              swiperRef.current.animating = false;
              swiperRef.current.allowSlideNext = true;
              swiperRef.current.allowSlidePrev = true;
              swiperRef.current.autoplay.stop();
              swiperRef.current.slideNext();
            }
          }}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm cursor-pointer disabled:opacity-50"
          aria-label="Next slide"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}

// Separate component for Video to handle its own refs and lifecycle effectively
function VideoSlideContent({ isActive, onEnded }: { isActive: boolean; onEnded: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      onEnded();
    };

    if (isActive) {
      video.currentTime = 0;
      video.play().catch(e => console.log("Video autoplay prevented:", e));
      video.addEventListener('ended', handleEnded);
    } else {
      video.pause();
      video.currentTime = 0;
      video.removeEventListener('ended', handleEnded);
    }

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [isActive, onEnded]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        src="/videos/CARTIFY_video.mp4"
        className="absolute inset-0 w-full h-full object-cover object-center"
        muted
        playsInline
      />

      <Link href="/collections" className="absolute inset-0 z-20 hover:bg-white/5 transition-colors duration-300" aria-label="Shop Collections">
        <span className="sr-only">Shop Collections</span>
      </Link>
    </div>
  );
}

