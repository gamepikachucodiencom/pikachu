'use client';

import { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics, Sprite, Texture, Assets } from 'pixi.js';
import { gsap } from 'gsap';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import styles from './InteractiveGameLobby.module.css';

/**
 * Recursively remove null/falsy children from a container to prevent updateLocalTransform on null.
 * Returns true if any null was found and removed.
 */
function removeNullChildren(container: Container): boolean {
  if (!container?.children?.length) return false;
  let foundNull = false;
  for (let i = container.children.length - 1; i >= 0; i--) {
    const c = container.children[i];
    if (c == null) {
      foundNull = true;
      (container.children as unknown as unknown[]).splice(i, 1);
    } else if ('children' in c && Array.isArray((c as Container).children)) {
      removeNullChildren(c as Container);
    }
  }
  return foundNull;
}

interface InteractiveGameLobbyProps {
  children?: React.ReactNode;
  onEnter?: () => void;
  title?: string;
  subtitle?: string;
  enterButtonText?: string;
  showEnterButton?: boolean;
}

interface Particle {
  /** Display object (Sprite or Graphics). Graphics used to avoid generateTexture() which can trigger updateLocalTransform on null. */
  sprite: Sprite | Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotationSpeed: number;
  scale: number;
}

export default function InteractiveGameLobby({
  children,
  onEnter,
  title = 'Chơi Cờ Tướng Online',
  subtitle,
  enterButtonText = 'Bắt Đầu',
  showEnterButton = true,
}: InteractiveGameLobbyProps) {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationContextRef = useRef<gsap.Context | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const isMountedRef = useRef(false);
  const hasAnimatedRef = useRef(false); // Prevent multiple entrance animations
  const isDestroyingRef = useRef(false); // Flag to prevent rendering during destruction

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize PixiJS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!canvasRef.current || isReducedMotion) return;
    if (isMountedRef.current) return; // Prevent double initialization in StrictMode
    isMountedRef.current = true;

    const app = new Application();
    appRef.current = app;

    app
      .init({
        canvas: canvasRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        background: 0x0a0a0a,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        autoStart: false, // We use our own requestAnimationFrame loop; prevents ticker from ever calling render()
      })
      .then(() => {
        // Double-check app is still valid and mounted
        if (!appRef.current || appRef.current !== app) return;
        if (!app.stage) return;
        if (isDestroyingRef.current) return; // Don't proceed if already destroying
        
        // CRITICAL: Stop ticker IMMEDIATELY and synchronously before anything else
        // This must happen before creating any display objects to prevent race conditions
        if (app.ticker) {
          // Stop ticker immediately - this is synchronous
          app.ticker.stop();
          app.ticker.autoStart = false;
        }

        // Sanitize stage in case Pixi left null children (prevents updateLocalTransform on null)
        removeNullChildren(app.stage as Container);

        if (app.ticker) {
          // Remove all listeners including the default render listener
            // Try multiple methods to ensure we remove the render listener
            try {
              // Note: Ticker doesn't have removeAllListeners() method
              // We'll manually clear listeners via the ticker's internal structure
              const ticker = app.ticker as any;
              if (Array.isArray(ticker._listeners)) {
                ticker._listeners.length = 0;
              }
            
            // Also try to remove the specific render callback if we can find it
            // The Application class adds a listener that calls app.render()
            // We need to find and remove it
            const listeners = (app.ticker as any)._listeners || [];
            if (Array.isArray(listeners)) {
              // Clear the listeners array directly
              listeners.length = 0;
            }
            
            // Also check for _head (linked list structure in some PixiJS versions)
            if ((app.ticker as any)._head) {
              (app.ticker as any)._head = null;
            }
          } catch (e) {
            console.warn('Error removing ticker listeners:', e);
          }
        }
        
        // CRITICAL: Defer particle creation to next frame to ensure ticker is fully stopped
        // This prevents any race conditions where the ticker might try to render
        // before sprites are properly parented
        requestAnimationFrame(() => {
          // Double-check again after deferring
          if (!appRef.current || appRef.current !== app) return;
          if (!app.stage || app.stage.destroyed) return;
          if (isDestroyingRef.current) return;
          // Note: Renderer doesn't have a 'destroyed' property, check if it exists instead
          if (!app.renderer) return;
          
          // Verify renderer context is valid
          const gl = (app.renderer as any).gl;
          if (gl && gl.isContextLost()) return;
          
          // Now safe to create particles
          createParticleSystem(app);
          startParticleAnimation(app);
        });
      })
      .catch((error) => {
        console.error('Failed to initialize PixiJS:', error);
      });

    const handleResize = () => {
      if (typeof window === 'undefined') return;
      if (app && app.stage && canvasRef.current) {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        // Reposition particles if needed
        particlesRef.current.forEach((particle) => {
          if (particle.x < 0) particle.x = window.innerWidth;
          if (particle.x > window.innerWidth) particle.x = 0;
          if (particle.y < 0) particle.y = window.innerHeight;
          if (particle.y > window.innerHeight) particle.y = 0;
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      // CRITICAL: Set destroying flag IMMEDIATELY as the very first thing
      // This prevents any render attempts during cleanup
      isDestroyingRef.current = true;
      isMountedRef.current = false;
      
      // Stop animation loop IMMEDIATELY - before anything else
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
      
      // Remove all particles from stage before destroying
      if (app && app.stage && !app.stage.destroyed) {
        particlesRef.current.forEach((particle) => {
          if (particle.sprite && !particle.sprite.destroyed && particle.sprite.parent) {
            try {
              particle.sprite.parent.removeChild(particle.sprite);
            } catch (e) {
              // Ignore if already removed
            }
          }
          if (particle.sprite && !particle.sprite.destroyed) {
            try {
              particle.sprite.destroy({ children: true });
            } catch (e) {
              // Ignore if already destroyed
            }
          }
        });
      }
      
      // Clear particles array
      particlesRef.current = [];
      
      // Stop ticker and destroy app safely
      if (app) {
        try {
          // CRITICAL: Stop ticker FIRST before doing anything else
          // This must happen synchronously to prevent any tick events
          // Note: Ticker doesn't have a 'destroyed' property, just check if it exists
          if (app.ticker) {
            // Stop immediately - this prevents any new tick events
            app.ticker.stop();
            app.ticker.autoStart = false;
            
            // CRITICAL: Destroy ticker FIRST to prevent any callbacks
            try {
              app.ticker.destroy();
            } catch (e) {
              // Ignore errors, but continue cleanup
            }
            
            // Remove all listeners including the default render listener
            // Try multiple methods to ensure complete cleanup
            try {
              // Method 1: Clear listeners array directly (Ticker doesn't have removeAllListeners)
              const ticker = app.ticker as any;
              if (Array.isArray(ticker._listeners)) {
                ticker._listeners.length = 0;
              }
              
              // Method 2: Clear listeners array directly
              const listeners = (app.ticker as any)._listeners;
              if (Array.isArray(listeners)) {
                listeners.length = 0;
              }
              
              // Method 3: Clear linked list structure (some PixiJS versions)
              if ((app.ticker as any)._head) {
                (app.ticker as any)._head = null;
              }
              
              // Method 4: Try to remove listeners one by one if remove() exists
              if (typeof app.ticker.remove === 'function' && Array.isArray(listeners)) {
                // Create a copy of listeners array to avoid modification during iteration
                const listenersCopy = [...listeners];
                listenersCopy.forEach((listener: any) => {
                  try {
                    app.ticker.remove(listener);
                  } catch (e) {
                    // Ignore errors
                  }
                });
              }
            } catch (e) {
              console.warn('Error removing ticker listeners:', e);
            }
          }
          
          // Remove all children from stage BEFORE destroying renderer
          if (app.stage && !app.stage.destroyed) {
            try {
              app.stage.removeChildren();
            } catch (e) {
              // Ignore errors during cleanup
            }
          }
          
          // CRITICAL: Destroy renderer BEFORE destroying app
          // This stops any pending render operations
          // Note: Renderer doesn't have a 'destroyed' property, just check if it exists
          if (app.renderer) {
            try {
              // Get WebGL context and mark it as lost if possible
              const gl = (app.renderer as any).gl;
              if (gl) {
                // Force context loss to prevent any further rendering
                try {
                  const loseContext = gl.getExtension('WEBGL_lose_context');
                  if (loseContext) {
                    loseContext.loseContext();
                  }
                } catch (e) {
                  // Ignore if extension not available
                }
              }
              app.renderer.destroy();
            } catch (e) {
              // Ignore errors during cleanup
            }
          }
          
          // Finally destroy the app
          // This will destroy any remaining resources
          try {
            app.destroy(true);
          } catch (e) {
            // Ignore errors during cleanup
          }
        } catch (error) {
          console.warn('Error destroying PixiJS app:', error);
        }
      }
      appRef.current = null;
      // Keep isDestroyingRef.current = true to prevent any late renders
      // Don't reset it here - let it stay true until component is completely unmounted
    };
  }, [isReducedMotion]);

  // Create particle system (Graphics-only to avoid generateTexture() which can trigger updateLocalTransform on null)
  const createParticleSystem = (app: Application) => {
    if (!app || !app.stage || app.stage.destroyed) return;
    if (isDestroyingRef.current) return;
    if (!app.renderer) return;

    const particleCount = 30;
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      const graphics = new Graphics();
      const radius = 15 + Math.random() * 10;
      graphics.circle(0, 0, radius);
      graphics.fill({ color: 0xdc2626, alpha: 0.3 });
      graphics.stroke({ width: 2, color: 0x991b1b, alpha: 0.5 });

      const scale = 0.5 + Math.random() * 0.5;
      graphics.x = Math.random() * app.screen.width;
      graphics.y = Math.random() * app.screen.height;
      graphics.alpha = 0.4 + Math.random() * 0.3;
      graphics.scale.set(scale);

      const speed = 0.5 + Math.random() * 0.5;
      const angle = Math.random() * Math.PI * 2;
      const particle: Particle = {
        sprite: graphics,
        x: graphics.x,
        y: graphics.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scale,
      };

      if (app.stage && !app.stage.destroyed) {
        try {
          app.stage.addChild(graphics);
          if (graphics.parent === app.stage) {
            particlesRef.current.push(particle);
          } else {
            graphics.destroy();
          }
        } catch (e) {
          console.warn('Error adding particle to stage:', e);
          graphics.destroy();
        }
      } else {
        graphics.destroy();
      }
    }
  };

  // Animate particles
  const startParticleAnimation = (app: Application) => {
    const animate = () => {
      // CRITICAL: Check destroying flag FIRST before any other checks
      if (isDestroyingRef.current) {
        animationFrameRef.current = null;
        return;
      }
      
      // Check if canvas still exists in DOM
      if (!canvasRef.current) {
        animationFrameRef.current = null;
        return;
      }
      
      // Check if app is still valid and mounted
      if (!app || !app.stage || app.stage.destroyed || !appRef.current || appRef.current !== app) {
        animationFrameRef.current = null;
        return;
      }

      // Check if component is still mounted
      if (!isMountedRef.current) {
        animationFrameRef.current = null;
        return;
      }

      // CRITICAL: Check if renderer is still valid and has a valid context
      // Note: Renderer doesn't have a 'destroyed' property, just check if it exists
      if (!app.renderer) {
        animationFrameRef.current = null;
        return;
      }
      
      // CRITICAL: Check if WebGL context is still valid
      const gl = (app.renderer as any).gl;
      if (!gl || gl.isContextLost()) {
        animationFrameRef.current = null;
        return;
      }
      
      // Check if canvas is still the app's canvas
      if (app.canvas !== canvasRef.current) {
        animationFrameRef.current = null;
        return;
      }
      
      // CRITICAL: Check if ticker is still running (it shouldn't be, but double-check)
      if (app.ticker && app.ticker.started) {
        // Ticker is still running - this shouldn't happen, but stop it
        try {
          app.ticker.stop();
        } catch (e) {
          // Ignore errors
        }
      }

      particlesRef.current.forEach((particle) => {
        // CRITICAL: Validate sprite and parent before accessing properties
        if (!particle.sprite || particle.sprite.destroyed) return;
        if (!particle.sprite.parent) return;
        // Ensure parent is still the stage
        if (particle.sprite.parent !== app.stage) return;
        
        // Update position with floating motion
        particle.x += particle.vx;
        particle.y += particle.vy + Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.5;
        particle.sprite.rotation += particle.rotationSpeed;

        // Wrap around screen edges
        if (particle.x < -50) particle.x = app.screen.width + 50;
        if (particle.x > app.screen.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = app.screen.height + 50;
        if (particle.y > app.screen.height + 50) particle.y = -50;

        // Update sprite position
        particle.sprite.x = particle.x;
        particle.sprite.y = particle.y;

        // Subtle scale pulsing
        const pulse = 1 + Math.sin(Date.now() * 0.002 + particle.x * 0.01) * 0.1;
        particle.sprite.scale.set(particle.scale * pulse);
      });

      try {
        // Additional safety check: verify renderer and stage are still valid
        if (
          app &&
          app.stage &&
          !app.stage.destroyed &&
          app.renderer &&
          app.renderer &&
          app.canvas &&
          canvasRef.current &&
          app.canvas === canvasRef.current
        ) {
          // Double-check renderer context is still valid
          const gl = (app.renderer as any).gl;
          if (gl && !gl.isContextLost()) {
            // CRITICAL: Remove any null children from stage before render
            // This prevents "Cannot read properties of null (reading 'updateLocalTransform')"
            removeNullChildren(app.stage as Container);

            // Validate all sprites have valid parents before rendering
            const hasInvalidSprites = particlesRef.current.some((particle) => {
              if (!particle.sprite || particle.sprite.destroyed) return false;
              return !particle.sprite.parent || particle.sprite.parent !== app.stage;
            });

            if (!hasInvalidSprites) {
              app.renderer.render(app.stage);
            } else {
              // Invalid sprites detected - stop animation to prevent errors
              console.warn('Invalid sprites detected, stopping animation');
              animationFrameRef.current = null;
              return;
            }
          } else {
            // Context lost, stop animation
            animationFrameRef.current = null;
            return;
          }
        } else {
          animationFrameRef.current = null;
          return;
        }
      } catch (error) {
        // If error occurs, stop animation immediately
        console.warn('Error rendering PixiJS stage:', error);
        animationFrameRef.current = null;
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Entrance animation - only run once
  useEffect(() => {
    // Prevent multiple animations (React StrictMode or re-renders)
    if (hasAnimatedRef.current) return;
    
    if (isReducedMotion) {
      // Skip animations for reduced motion
      if (overlayRef.current) overlayRef.current.style.opacity = '1';
      if (paperRef.current) paperRef.current.style.opacity = '1';
      hasAnimatedRef.current = true;
      return;
    }

    // Wait for refs to be ready before animating
    const checkAndAnimate = () => {
      if (hasAnimatedRef.current) return; // Already animated
      if (!overlayRef.current || !paperRef.current) {
        // Retry if refs aren't ready yet
        requestAnimationFrame(checkAndAnimate);
        return;
      }

      // Mark as animated immediately to prevent re-triggering
      hasAnimatedRef.current = true;
      
      const ctx = gsap.context(() => {
        // Overlay fade in with upward motion
        if (overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: 'power3.out',
            }
          );
        }

        // Paper container stagger in
        if (paperRef.current) {
          gsap.fromTo(
            paperRef.current,
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.8,
              delay: 0.2,
              ease: 'back.out(1.2)',
            }
          );
        }

        // Title animation
        if (titleRef.current) {
          gsap.fromTo(
            titleRef.current,
            { opacity: 0, y: -20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: 0.4,
              ease: 'power2.out',
            }
          );
        }

        // Children stagger in - only if children exist
        if (paperRef.current && children) {
          const childrenElements = paperRef.current.querySelectorAll(':scope > *:not(h1)');
          if (childrenElements.length > 0) {
            gsap.fromTo(
              childrenElements,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: 0.6,
                stagger: 0.1,
                ease: 'power2.out',
              }
            );
          }
        }
      });

      animationContextRef.current = ctx;
    };

    // Start animation check on next frame
    requestAnimationFrame(checkAndAnimate);

    return () => {
      // Cleanup: only revert if component is actually unmounting
      // Don't revert on re-renders to prevent flashing
      if (animationContextRef.current && !isMountedRef.current) {
        animationContextRef.current.revert();
        animationContextRef.current = null;
      }
    };
  }, []); // Empty deps - only run once on mount, regardless of children changes

  const handleEnter = () => {
    if (isReducedMotion) {
      onEnter?.();
      return;
    }

    // Exit animation
    const ctx = gsap.context(() => {
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => {
            onEnter?.();
          },
        });
      }

      // Particles fade out
      particlesRef.current.forEach((particle, index) => {
        gsap.to(particle.sprite, {
          alpha: 0,
          scale: 0,
          duration: 0.8,
          delay: index * 0.02,
          ease: 'power2.in',
        });
      });
    });

    return () => ctx.revert();
  };

  return (
    <div className={styles.lobbyWrapper}>
      {/* PixiJS Canvas Background */}
      {!isReducedMotion && (
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
        />
      )}

      {/* UI Overlay */}
      <div ref={overlayRef} className={styles.overlay}>
        <div className={styles.container}>
          <div
            ref={paperRef}
            className={styles.paper}
          >
            <div className={styles.content}>
              {title && (
                <h1
                  ref={titleRef}
                  className={styles.title}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p className={styles.subtitle}>
                  {subtitle}
                </p>
              )}

              {children && <div className={styles.children}>{children}</div>}

              {showEnterButton && (
                <button
                  onClick={handleEnter}
                  className={styles.enterButton}
                >
                  {enterButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
