'use client';

import React, { useEffect, useRef, useState } from 'react';

// ============================================
// BACKGROUND EFFECTS COMPONENT (PixiJS-like)
// ============================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  fadeSpeed: number;
  swayAmplitude: number;
  swaySpeed: number;
  swayOffset: number;
  rotation: number;
  rotationSpeed: number;
  type: 'dust' | 'leaf';
}

interface BackgroundEffectsProps {
  width: number;
  height: number;
  particleCount?: number;
  enableLeaves?: boolean;
  leafRatio?: number; // 0-1, how many particles are leaves vs dust
  intensity?: 'subtle' | 'medium' | 'strong';
}

export default function BackgroundEffects({
  width = 1836,
  height = 2000,
  particleCount = 40,
  enableLeaves = true,
  leafRatio = 0.2,
  intensity = 'subtle',
}: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  // Intensity presets
  const intensitySettings = {
    subtle: { count: 30, speed: 0.3, opacity: 0.15 },
    medium: { count: 50, speed: 0.5, opacity: 0.25 },
    strong: { count: 80, speed: 0.8, opacity: 0.35 },
  };

  const settings = intensitySettings[intensity];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const count = particleCount || settings.count;

      for (let i = 0; i < count; i++) {
        const isLeaf = enableLeaves && Math.random() < leafRatio;

        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2 * settings.speed,
          vy: (Math.random() * 0.3 + 0.1) * settings.speed,
          size: isLeaf ? Math.random() * 8 + 6 : Math.random() * 2.5 + 1,
          opacity: Math.random() * settings.opacity + 0.05,
          fadeSpeed: Math.random() * 0.005 + 0.002,
          swayAmplitude: Math.random() * 0.5 + 0.3,
          swaySpeed: Math.random() * 0.02 + 0.01,
          swayOffset: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          type: isLeaf ? 'leaf' : 'dust',
        });
      }
    };

    initParticles();

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.016;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position with sway
        const sway =
          Math.sin(time * particle.swaySpeed + particle.swayOffset) *
          particle.swayAmplitude;
        particle.x += particle.vx + sway;
        particle.y += particle.vy;

        // Update rotation for leaves
        if (particle.type === 'leaf') {
          particle.rotation += particle.rotationSpeed;
        }

        // Wrap around edges
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y > height + 20) {
          particle.y = -20;
          particle.x = Math.random() * width;
        }

        // Pulse opacity
        particle.opacity +=
          Math.sin(time * 2 + particle.swayOffset) * particle.fadeSpeed;
        particle.opacity = Math.max(
          0.05,
          Math.min(settings.opacity, particle.opacity)
        );

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);

        if (particle.type === 'leaf') {
          // Draw bamboo leaf
          ctx.rotate(particle.rotation);
          ctx.fillStyle = '#4a7046';
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            particle.size,
            particle.size * 2.5,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Leaf vein
          ctx.strokeStyle = '#3d5a3a';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, -particle.size * 2);
          ctx.lineTo(0, particle.size * 2);
          ctx.stroke();
        } else {
          // Draw dust mote
          const gradient = ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            particle.size
          );
          gradient.addColorStop(0, '#f5ebe0');
          gradient.addColorStop(0.5, '#d4a574');
          gradient.addColorStop(1, 'rgba(212, 165, 116, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, particleCount, enableLeaves, leafRatio, intensity]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
