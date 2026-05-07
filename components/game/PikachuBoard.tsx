'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Application, Container, Graphics, Sprite, Assets } from 'pixi.js';
import styles from './PikachuBoard.module.css';
import { useTimerStore } from '../../stores/useTimerStore';

const ROWS = 9;
const COLS = 16;

const TILE_WIDTH = 42;
const TILE_HEIGHT = 54;
const BORDER_MARGIN = 15;
const BOARD_WIDTH = COLS * TILE_WIDTH + BORDER_MARGIN * 2;
const BOARD_HEIGHT = ROWS * TILE_HEIGHT + BORDER_MARGIN * 2;

const V_ROWS = ROWS + 2;
const V_COLS = COLS + 2;
const TOTAL_PAIRS = (ROWS * COLS) / 2;
const TOTAL_ICONS = 36;

type Point = { r: number; c: number };

export default function PikachuBoard({
  theme = 'pokemon',
  onOpenMenu,
}: {
  theme?: string;
  onOpenMenu?: () => void;
}) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  // LẤY STATE TỪ STORE THỜI GIAN
  const {
    timeLeft,
    maxTime,
    startGameTimer,
    pauseGameTimer,
    initGameTimer,
    clearTimer,
  } = useTimerStore();

  const themeIcons = useMemo(() => {
    return Array.from(
      { length: TOTAL_ICONS },
      (_, i) => `/assets/${theme}/${i + 1}.png`
    );
  }, [theme]);

  // --- TRẠNG THÁI GAME ---
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>(
    'playing'
  );
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [level, setLevel] = useState(1);
  const [shuffles, setShuffles] = useState(10);
  const [isMuted, setIsMuted] = useState(false);

  const isMutedRef = useRef(isMuted);
  const levelRef = useRef(level);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const triggerShuffleRef = useRef<(() => void) | null>(null);
  const triggerBoardRebuildRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.matchMedia(
        '(orientation: portrait)'
      ).matches;
      const isMobile = window.innerWidth <= 1024 || window.innerHeight <= 1024;
      setIsPortrait(isPortraitMode && isMobile);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // KHỞI TẠO ĐỒNG HỒ KHI VÀO GAME
  useEffect(() => {
    initGameTimer(1);
    return () => clearTimer(); // Dọn dẹp khi thoát component
  }, [initGameTimer, clearTimer]);

  // ĐIỀU KHIỂN CHẠY/DỪNG ĐỒNG HỒ DỰA THEO TRẠNG THÁI GAME
  useEffect(() => {
    if (gameState === 'playing') {
      startGameTimer();
    } else {
      pauseGameTimer();
    }
  }, [gameState, startGameTimer, pauseGameTimer]);

  // NẾU HẾT GIỜ -> XỬ THUA GAME
  useEffect(() => {
    // Phải có maxTime > 0 để chặn thằng React bắt lỗi láo lúc vừa F5
    if (maxTime > 0 && timeLeft <= 0 && gameState === 'playing') {
      setGameState('lost');
    }
  }, [timeLeft, maxTime, gameState]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !pixiContainerRef.current ||
      gameState !== 'playing'
    )
      return;

    const containerElement = pixiContainerRef.current;
    const app = new Application();
    let isDestroyed = false;

    let board: string[][] = Array(V_ROWS)
      .fill(null)
      .map(() => Array(V_COLS).fill(''));
    let tileContainers: (Container | null)[][] = Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));
    let selectedTile: { r: number; c: number; bg: Graphics } | null = null;
    let isAnimating = false;
    let tileValues: string[] = [];

    const playSound = (type: 'click' | 'match' | 'error' | 'shuffle') => {
      if (isMutedRef.current) return;
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.6;
      audio.play().catch(() => {});
    };

    const initPixi = async () => {
      await app.init({
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        backgroundColor: 0x111827,
        resolution: Math.max(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (isDestroyed) {
        app.destroy(true, true);
        return;
      }

      const canvasEl = app.canvas;

      // Ép cứng 100% khung cha, objectFit sẽ lo việc giữ đúng tỉ lệ không bị méo ảnh
      canvasEl.style.width = '100%';
      canvasEl.style.height = '100%';
      canvasEl.style.objectFit = 'contain';
      canvasEl.style.touchAction = 'none';

      containerElement.appendChild(canvasEl);

      // THÊM CÁI NÀY ĐỂ ÉP ẢNH CANVAS KHÔNG BỊ MÉO TRÊN MOBILE
      canvasEl.style.objectFit = 'contain';

      canvasEl.style.touchAction = 'none';
      containerElement.appendChild(canvasEl);

      const gameContainer = new Container();
      app.stage.addChild(gameContainer);
      const lineGraphics = new Graphics();
      app.stage.addChild(lineGraphics);

      await Assets.load(themeIcons);

      const generateInitialTiles = () => {
        tileValues = [];
        for (let i = 0; i < TOTAL_PAIRS; i++) {
          const randomIcon =
            themeIcons[Math.floor(Math.random() * themeIcons.length)];
          tileValues.push(randomIcon, randomIcon);
        }
        tileValues = tileValues.sort(() => Math.random() - 0.5);
      };

      if (matchedPairs === 0) generateInitialTiles();

      const renderBoard = () => {
        gameContainer.removeChildren();
        let index = 0;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (tileValues[index] !== '') {
              board[r + 1][c + 1] = tileValues[index];
              const cell = new Container();
              cell.x = c * TILE_WIDTH + BORDER_MARGIN;
              cell.y = r * TILE_HEIGHT + BORDER_MARGIN;

              const tileBg = new Graphics()
                .rect(1, 1, TILE_WIDTH - 2, TILE_HEIGHT - 2)
                .fill(0x1f2937)
                .stroke({ width: 1, color: 0x374151 });

              const texture = Assets.get(tileValues[index]);

              if (texture && texture.source) {
                texture.source.scaleMode = 'nearest';
              }

              const sprite = new Sprite(texture);
              sprite.width = TILE_WIDTH - 6;
              sprite.height = TILE_HEIGHT - 6;
              sprite.x = 3;
              sprite.y = 3;

              cell.addChild(tileBg);
              cell.addChild(sprite);
              gameContainer.addChild(cell);
              tileContainers[r][c] = cell;

              cell.eventMode = 'static';
              cell.cursor = 'pointer';
              cell.on('pointerdown', () => handleTileClick(r, c, tileBg));
            } else {
              board[r + 1][c + 1] = '';
              tileContainers[r][c] = null;
            }
            index++;
          }
        }
      };

      triggerBoardRebuildRef.current = () => {
        generateInitialTiles();
        renderBoard();
      };

      renderBoard();

      const findPath = (
        p1: Point,
        p2: Point,
        grid: string[][]
      ): Point[] | null => {
        const dirs = [
          [-1, 0],
          [0, 1],
          [1, 0],
          [0, -1],
        ];
        const visited = Array(V_ROWS)
          .fill(null)
          .map(() => Array(V_COLS).fill(Infinity));
        const q: { r: number; c: number; path: Point[]; segments: number }[] =
          [];

        for (let i = 0; i < 4; i++) {
          let nr = p1.r + dirs[i][0];
          let nc = p1.c + dirs[i][1];
          let currentPath = [{ r: p1.r, c: p1.c }];
          while (nr >= 0 && nr < V_ROWS && nc >= 0 && nc < V_COLS) {
            currentPath.push({ r: nr, c: nc });
            if (nr === p2.r && nc === p2.c) return currentPath;
            if (grid[nr][nc] !== '') break;
            if (visited[nr][nc] > 1) {
              visited[nr][nc] = 1;
              q.push({ r: nr, c: nc, path: [...currentPath], segments: 1 });
            }
            nr += dirs[i][0];
            nc += dirs[i][1];
          }
        }

        let head = 0;
        while (head < q.length) {
          const curr = q[head++];
          if (curr.segments >= 3) continue;
          for (let i = 0; i < 4; i++) {
            let nr = curr.r + dirs[i][0];
            let nc = curr.c + dirs[i][1];
            let currentPath = [...curr.path];
            while (nr >= 0 && nr < V_ROWS && nc >= 0 && nc < V_COLS) {
              currentPath.push({ r: nr, c: nc });
              if (nr === p2.r && nc === p2.c) return currentPath;
              if (grid[nr][nc] !== '') break;
              if (visited[nr][nc] > curr.segments + 1) {
                visited[nr][nc] = curr.segments + 1;
                q.push({
                  r: nr,
                  c: nc,
                  path: [...currentPath],
                  segments: curr.segments + 1,
                });
              }
              nr += dirs[i][0];
              nc += dirs[i][1];
            }
          }
        }
        return null;
      };

      const hasMovesLeft = (): boolean => {
        const icons: { [key: string]: Point[] } = {};
        for (let r = 1; r <= ROWS; r++) {
          for (let c = 1; c <= COLS; c++) {
            if (board[r][c] !== '') {
              if (!icons[board[r][c]]) icons[board[r][c]] = [];
              icons[board[r][c]].push({ r, c });
            }
          }
        }
        for (const key in icons) {
          const points = icons[key];
          for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
              if (findPath(points[i], points[j], board)) return true;
            }
          }
        }
        return false;
      };

      const doShuffle = () => {
        setShuffles((prev) => {
          if (prev <= 0) {
            setGameState('lost');
            return 0;
          }
          return prev - 1;
        });
        playSound('shuffle');
        let remainingIcons: string[] = [];
        for (let r = 1; r <= ROWS; r++) {
          for (let c = 1; c <= COLS; c++) {
            if (board[r][c] !== '') remainingIcons.push(board[r][c]);
          }
        }
        remainingIcons = remainingIcons.sort(() => Math.random() - 0.5);
        let newIndex = 0;
        for (let i = 0; i < tileValues.length; i++) {
          if (tileValues[i] !== '') tileValues[i] = remainingIcons[newIndex++];
        }
        selectedTile = null;
        renderBoard();
      };
      triggerShuffleRef.current = doShuffle;

      const applyGravity = () => {
        let moved = false;
        const currentLevel = levelRef.current;
        const halfCols = Math.floor(COLS / 2);
        const halfRows = Math.floor(ROWS / 2);

        const pattern = ((currentLevel - 1) % 9) + 1;

        if (pattern === 1) {
          return;
        } else if (pattern === 2) {
          for (let c = 1; c <= COLS; c++) {
            let colData = [];
            for (let r = ROWS; r >= 1; r--)
              if (board[r][c] !== '') colData.push(board[r][c]);
            let writeRow = ROWS;
            for (let val of colData) {
              if (board[writeRow][c] !== val) moved = true;
              board[writeRow][c] = val;
              writeRow--;
            }
            for (let r = writeRow; r >= 1; r--) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }
          }
        } else if (pattern === 3) {
          for (let r = 1; r <= ROWS; r++) {
            let rowData = [];
            for (let c = 1; c <= COLS; c++)
              if (board[r][c] !== '') rowData.push(board[r][c]);
            let writeCol = 1;
            for (let val of rowData) {
              if (board[r][writeCol] !== val) moved = true;
              board[r][writeCol] = val;
              writeCol++;
            }
            for (let c = writeCol; c <= COLS; c++) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }
          }
        } else if (pattern === 4) {
          for (let r = 1; r <= ROWS; r++) {
            let rowData = [];
            for (let c = COLS; c >= 1; c--)
              if (board[r][c] !== '') rowData.push(board[r][c]);
            let writeCol = COLS;
            for (let val of rowData) {
              if (board[r][writeCol] !== val) moved = true;
              board[r][writeCol] = val;
              writeCol--;
            }
            for (let c = writeCol; c >= 1; c--) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }
          }
        } else if (pattern === 5) {
          for (let c = 1; c <= COLS; c++) {
            let colData = [];
            for (let r = 1; r <= ROWS; r++)
              if (board[r][c] !== '') colData.push(board[r][c]);
            let writeRow = 1;
            for (let val of colData) {
              if (board[writeRow][c] !== val) moved = true;
              board[writeRow][c] = val;
              writeRow++;
            }
            for (let r = writeRow; r <= ROWS; r++) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }
          }
        } else if (pattern === 6) {
          for (let r = 1; r <= ROWS; r++) {
            let leftData = [];
            for (let c = 1; c <= halfCols; c++)
              if (board[r][c] !== '') leftData.push(board[r][c]);
            let wCol = 1;
            for (let val of leftData) {
              if (board[r][wCol] !== val) moved = true;
              board[r][wCol] = val;
              wCol++;
            }
            for (let c = wCol; c <= halfCols; c++) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }

            let rightData = [];
            for (let c = COLS; c > halfCols; c--)
              if (board[r][c] !== '') rightData.push(board[r][c]);
            wCol = COLS;
            for (let val of rightData) {
              if (board[r][wCol] !== val) moved = true;
              board[r][wCol] = val;
              wCol--;
            }
            for (let c = wCol; c > halfCols; c--) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }
          }
        } else if (pattern === 7) {
          for (let c = 1; c <= COLS; c++) {
            let topData = [];
            for (let r = 1; r <= halfRows; r++)
              if (board[r][c] !== '') topData.push(board[r][c]);
            let wRow = 1;
            for (let val of topData) {
              if (board[wRow][c] !== val) moved = true;
              board[wRow][c] = val;
              wRow++;
            }
            for (let r = wRow; r <= halfRows; r++) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }

            let bottomData = [];
            for (let r = ROWS; r > halfRows; r--)
              if (board[r][c] !== '') bottomData.push(board[r][c]);
            wRow = ROWS;
            for (let val of bottomData) {
              if (board[wRow][c] !== val) moved = true;
              board[wRow][c] = val;
              wRow--;
            }
            for (let r = wRow; r > halfRows; r--) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }
          }
        } else if (pattern === 8) {
          for (let r = 1; r <= ROWS; r++) {
            let rowDataLeft = [],
              rowDataRight = [];
            for (let c = halfCols; c >= 1; c--)
              if (board[r][c] !== '') rowDataLeft.push(board[r][c]);
            for (let c = halfCols + 1; c <= COLS; c++)
              if (board[r][c] !== '') rowDataRight.push(board[r][c]);

            let wCol = halfCols;
            for (let val of rowDataLeft) {
              if (board[r][wCol] !== val) moved = true;
              board[r][wCol] = val;
              wCol--;
            }
            for (let c = wCol; c >= 1; c--) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }

            wCol = halfCols + 1;
            for (let val of rowDataRight) {
              if (board[r][wCol] !== val) moved = true;
              board[r][wCol] = val;
              wCol++;
            }
            for (let c = wCol; c <= COLS; c++) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }
          }
        } else if (pattern === 9 || pattern === 0) {
          for (let r = 1; r <= ROWS; r++) {
            let leftData = [];
            for (let c = 1; c <= halfCols; c++)
              if (board[r][c] !== '') leftData.push(board[r][c]);
            let wCol = 1;
            for (let val of leftData) {
              if (board[r][wCol] !== val) moved = true;
              board[r][wCol] = val;
              wCol++;
            }
            for (let c = wCol; c <= halfCols; c++) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }

            let rightData = [];
            for (let c = COLS; c > halfCols; c--)
              if (board[r][c] !== '') rightData.push(board[r][c]);
            wCol = COLS;
            for (let val of rightData) {
              if (board[r][wCol] !== val) moved = true;
              board[r][wCol] = val;
              wCol--;
            }
            for (let c = wCol; c > halfCols; c--) {
              if (board[r][c] !== '') moved = true;
              board[r][c] = '';
            }
          }
        }

        if (moved) {
          tileValues = [];
          for (let r = 1; r <= ROWS; r++) {
            for (let c = 1; c <= COLS; c++) tileValues.push(board[r][c]);
          }
          renderBoard();
        }
      };

      const highlight = (bg: Graphics) =>
        bg
          .clear()
          .rect(1, 1, TILE_WIDTH - 2, TILE_HEIGHT - 2)
          .fill(0x4b5563)
          .stroke({ width: 2, color: 0xfacc15 });

      const unhighlight = (bg: Graphics) =>
        bg
          .clear()
          .rect(1, 1, TILE_WIDTH - 2, TILE_HEIGHT - 2)
          .fill(0x1f2937)
          .stroke({ width: 1, color: 0x374151 });

      const handleTileClick = (r: number, c: number, bg: Graphics) => {
        const vr = r + 1;
        const vc = c + 1;
        if (isAnimating || board[vr][vc] === '') return;

        if (!selectedTile) {
          selectedTile = { r, c, bg };
          highlight(bg);
          playSound('click');
          return;
        }
        if (selectedTile.r === r && selectedTile.c === c) {
          unhighlight(bg);
          selectedTile = null;
          playSound('error');
          return;
        }

        const sv_r = selectedTile.r + 1;
        const sv_c = selectedTile.c + 1;

        if (board[sv_r][sv_c] === board[vr][vc]) {
          const realPath = findPath(
            { r: sv_r, c: sv_c },
            { r: vr, c: vc },
            board
          );
          if (realPath) {
            isAnimating = true;
            playSound('match');
            drawLine(realPath);
            board[sv_r][sv_c] = '';
            board[vr][vc] = '';
            tileValues[selectedTile.r * COLS + selectedTile.c] = '';
            tileValues[r * COLS + c] = '';

            const t1 = tileContainers[selectedTile.r][selectedTile.c];
            const t2 = tileContainers[r][c];

            // CỘNG ĐIỂM VÀ BƠM MÁU THỜI GIAN KHI ĂN ĐƯỢC 1 CẶP
            setScore((s) => s + 10);
            useTimerStore.getState().addBonusTime(2); // Thưởng 2 giây

            setTimeout(() => {
              if (t1) t1.visible = false;
              if (t2) t2.visible = false;
              lineGraphics.clear();
              selectedTile = null;
              isAnimating = false;

              applyGravity();

              setMatchedPairs((prev) => {
                const currentMatches = prev + 1;

                // NẾU QUA MÀN
                if (currentMatches === TOTAL_PAIRS) {
                  playSound('shuffle');
                  const nextLevel = levelRef.current + 1;
                  setLevel(nextLevel);
                  setShuffles((s) => s + 1);

                  // SET THỜI GIAN THEO LEVEL MỚI BẰNG STORE
                  useTimerStore.getState().initGameTimer(nextLevel);
                  useTimerStore.getState().startGameTimer();

                  setTimeout(() => {
                    triggerBoardRebuildRef.current?.();
                  }, 500);

                  return 0;
                }

                if (!hasMovesLeft() && currentMatches < TOTAL_PAIRS)
                  doShuffle();
                return currentMatches;
              });
            }, 300);
            return;
          }
        }
        playSound('error');
        unhighlight(selectedTile.bg);
        selectedTile = { r, c, bg };
        highlight(bg);
      };

      const drawLine = (path: Point[]) => {
        lineGraphics.clear();
        const getPixelPos = (vr: number, vc: number) => {
          let x, y;
          if (vc === 0) x = BORDER_MARGIN / 2;
          else if (vc === V_COLS - 1) x = BOARD_WIDTH - BORDER_MARGIN / 2;
          else x = (vc - 1) * TILE_WIDTH + BORDER_MARGIN + TILE_WIDTH / 2;

          if (vr === 0) y = BORDER_MARGIN / 2;
          else if (vr === V_ROWS - 1) y = BOARD_HEIGHT - BORDER_MARGIN / 2;
          else y = (vr - 1) * TILE_HEIGHT + BORDER_MARGIN + TILE_HEIGHT / 2;
          return { x, y };
        };
        const pointsPixel = path.map((p) => getPixelPos(p.r, p.c));
        lineGraphics.moveTo(pointsPixel[0].x, pointsPixel[0].y);
        for (let i = 1; i < pointsPixel.length; i++)
          lineGraphics.lineTo(pointsPixel[i].x, pointsPixel[i].y);
        lineGraphics.stroke({ width: 12, color: 0x10b981, alpha: 0.4 });
        lineGraphics.moveTo(pointsPixel[0].x, pointsPixel[0].y);
        for (let i = 1; i < pointsPixel.length; i++)
          lineGraphics.lineTo(pointsPixel[i].x, pointsPixel[i].y);
        lineGraphics.stroke({ width: 3, color: 0xffffff });
      };

      if (!hasMovesLeft() && matchedPairs < TOTAL_PAIRS) doShuffle();
    };

    initPixi();
    return () => {
      isDestroyed = true;
      try {
        app.destroy(true, true);
      } catch (e) {}
    };
  }, [gameState, themeIcons]);

  // --- HÀM RESET GAME TỐI ƯU (Thay thế reload web) ---
  const resetGame = () => {
    if (!isMutedRef.current) {
      const audio = new Audio('/sounds/restart.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    }

    // Đưa mọi thứ về lại số 0
    setScore(0);
    setLevel(1);
    setShuffles(10);
    setMatchedPairs(0);
    setGameState('playing');

    // Đặt lại đồng hồ
    initGameTimer(1);
    startGameTimer();

    // Kích hoạt build lại bàn cờ PixiJS lập tức
    setTimeout(() => {
      triggerBoardRebuildRef.current?.();
    }, 100);
  };

  // ================= UI COMPONENTS =================
  const StatBlock = ({
    title,
    value,
    color,
  }: {
    title: string;
    value: number | string;
    color: string;
  }) => (
    <div className={styles.statBlock}>
      <div className={styles.statTitle} style={{ color }}>
        {title}
      </div>
      <div
        className={styles.statValue}
        style={{ fontSize: value.toString().length > 4 ? '0.9rem' : '1.2rem' }}
      >
        {value}
      </div>
    </div>
  );

  const ActionBtn = ({ icon, text, onClick }: any) => (
    <button className={styles.actionBtn} onClick={onClick}>
      <span className={styles.actionIcon}>{icon}</span>
      <span className={styles.actionText}>{text}</span>
    </button>
  );

  // TÍNH TOÁN % CHO THANH THỜI GIAN BÊN PHẢI
  const timePercentage = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;
  const isTimeWarning = timeLeft <= 60; // Báo động đỏ khi dưới 60s

  return (
    <div className={styles.gameWrapper}>
      {/* --- CỘT TRÁI (SIDEBAR GAME) --- */}
      <div className={styles.leftSidebar}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '5px',
          }}
        >
          <StatBlock title="BÀN" value={level} color="#3b82f6" />
          <StatBlock title="ĐỔI" value={shuffles} color="#a855f7" />
          <StatBlock title="ĐIỂM" value={score} color="#10b981" />
        </div>

        <div style={{ flex: 1 }} />

        <div className={styles.bottomActions}>
          <ActionBtn
            icon={isMuted ? '🔇' : '🔊'}
            text={isMuted ? 'Bật âm' : 'Tắt âm'}
            onClick={() => setIsMuted(!isMuted)}
          />
          <ActionBtn
            icon="🔄"
            text="Đảo cờ"
            onClick={() => triggerShuffleRef.current?.()}
          />
          {/* NÚT CHƠI LẠI TRONG SIDEBAR */}
          <ActionBtn icon="🕹️" text="Chơi lại" onClick={resetGame} />
        </div>
      </div>

      <button
        className={styles.mobileMenuBtnCapsule}
        onClick={() => onOpenMenu && onOpenMenu()}
        title="Chọn Game Khác"
      >
        <span className={styles.menuIcon}>🎮</span>
        <span className={styles.menuText}>Game Khác</span>
      </button>

      {/* --- BÀN CỜ PIXIJS --- */}
      <div
        ref={pixiContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 0,
          minHeight: 0,
          /* ÉP BÀN CỜ VỪA MÀN HÌNH MOBILE */
          height: '100%',
          overflow: 'hidden',
        }}
      />

      {/* --- CỘT PHẢI (THANH THỜI GIAN) --- */}
      <div className={styles.rightSidebar}>
        <div className={styles.timeBarContainer}>
          <div
            className={styles.timeBarFill}
            style={{
              height: `${timePercentage}%`,
              backgroundColor: isTimeWarning ? '#ef4444' : '#03A9F4',
              boxShadow: isTimeWarning
                ? '0 0 10px rgba(239, 68, 68, 0.6)'
                : '0 0 10px rgba(3, 169, 244, 0.5)',
              transition: 'height 1s linear, background-color 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* --- MÀN HÌNH THẮNG / THUA --- */}
      {gameState !== 'playing' && (
        <div className={styles.overlay}>
          <h2 style={{ color: gameState === 'won' ? '#10b981' : '#ef4444' }}>
            {gameState === 'won' ? '🎉 PHÁ ĐẢO! 🎉' : '💀 HẾT GIỜ! 💀'}
          </h2>
          <p>
            Bạn đã đạt Tầng{' '}
            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
              {level}
            </span>
          </p>
          <p>
            Tổng điểm:{' '}
            <span
              style={{ color: '#facc15', fontWeight: 'bold', fontSize: '2rem' }}
            >
              {score}
            </span>
          </p>
          {/* NÚT CHƠI LẠI TRÊN MÀN HÌNH OVERLAY */}
          <button className={styles.overlayBtn} onClick={resetGame}>
            Chơi Lại
          </button>
        </div>
      )}

      {/* --- CẢNH BÁO XOAY MÀN HÌNH --- */}
      {isPortrait && (
        <div className={styles.portraitOverlay}>
          <div className={styles.portraitIcon}>🔄</div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            Xoay Ngang Để Chơi
          </h2>
        </div>
      )}
    </div>
  );
}
