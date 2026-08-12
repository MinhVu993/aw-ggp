"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { X, CaretLeft, CaretRight, Images } from '@phosphor-icons/react';

interface ImageCarouselModalProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

export default function ImageCarouselModal({
  images,
  initialIndex = 0,
  onClose,
  title
}: ImageCarouselModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    startIndex: initialIndex,
    loop: true 
  });
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') scrollPrev();
      if (e.key === 'ArrowRight') scrollNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, scrollPrev, scrollNext]);

  if (!images || images.length === 0) return null;

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        backdropFilter: "blur(6px)",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "860px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          padding: "0 0.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem", fontWeight: 700 }}>
            <Images size={20} color="var(--accent-primary)" weight="bold" />
            <span>{title || "Hình ảnh đối chiếu hàng hóa"}</span>
            <span style={{ 
              background: "rgba(255, 255, 255, 0.15)", 
              padding: "2px 8px", 
              borderRadius: "12px", 
              fontSize: "0.75rem",
              fontWeight: 600
            }}>
              {selectedIndex + 1} / {images.length}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            title="Đóng (Esc)"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Embla Viewport */}
        <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: "8px" }} ref={emblaRef}>
          <div style={{ display: "flex", userSelect: "none" }}>
            {images.map((imgUrl, index) => (
              <div 
                key={index} 
                style={{ 
                  flex: "0 0 100%", 
                  minWidth: 0, 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  height: "60vh",
                  background: "#09090b",
                  borderRadius: "8px"
                }}
              >
                <img
                  src={imgUrl}
                  alt={`Angle ${index + 1}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "6px"
                  }}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Prev / Next Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0, 0, 0, 0.65)",
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                  transition: "background 0.2s ease",
                  zIndex: 10
                }}
                title="Ảnh trước (Mũi tên trái)"
              >
                <CaretLeft size={22} weight="bold" />
              </button>

              <button
                onClick={scrollNext}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0, 0, 0, 0.65)",
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                  transition: "background 0.2s ease",
                  zIndex: 10
                }}
                title="Ảnh tiếp theo (Mũi tên phải)"
              >
                <CaretRight size={22} weight="bold" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {images.length > 1 && (
          <div style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.4rem 0.6rem",
            background: "rgba(255, 255, 255, 0.06)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            overflowX: "auto",
            maxWidth: "100%",
            boxSizing: "border-box"
          }}>
            {images.map((imgUrl, index) => {
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollTo(index)}
                  style={{
                    width: "48px",
                    height: "48px",
                    padding: 0,
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: isSelected ? "2px solid var(--accent-primary)" : "1px solid rgba(255,255,255,0.2)",
                    opacity: isSelected ? 1 : 0.6,
                    background: "#000",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s ease"
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
