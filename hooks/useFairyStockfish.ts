'use client';

import { useEffect, useState, useRef } from 'react';
// We import 'type' to avoid bundling the actual JS code during SSR
import type { FairyStockfish, ModuleOptions } from 'ffish-es6';

// Define the shape of our hook's return value
interface UseFairyStockfishReturn {
  engine: FairyStockfish | null;
  isReady: boolean;
}

export function useFairyStockfish(): UseFairyStockfishReturn {
  const [engine, setEngine] = useState<FairyStockfish | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Ref to track initialization status strictly
  const engineRef = useRef<FairyStockfish | null>(null);

  useEffect(() => {
    let mounted = true;

    const initEngine = async () => {
      try {
        // Dynamic import to prevent Server-Side Rendering (SSR) crashes
        // The library exports the Module factory as default
        const ffishModule = await import('ffish-es6');
        const ModuleFactory = ffishModule.default;

        const options: ModuleOptions = {
          locateFile: (file: string, prefix: string) => {
            // Point to the public folder we set up in Step 2
            if (file.endsWith('.wasm')) {
              return `/wasm/${file}`;
            }
            return prefix + file;
          },
        };

        const instance = await ModuleFactory(options);

        if (mounted) {
          engineRef.current = instance;
          setEngine(instance);
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to load Fairy-Stockfish:', error);
      }
    };

    if (!engineRef.current) {
      initEngine();
    }

    return () => {
      mounted = false;
    };
  }, []);

  return { engine, isReady };
}
