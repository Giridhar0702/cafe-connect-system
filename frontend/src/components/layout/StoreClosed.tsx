import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StoreClosedProps {
  reopenDate: string;
}

const DragonGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  
  // Game state
  const dinoRef = useRef({ x: 50, y: 150, width: 40, height: 40, velocityY: 0, gravity: 0.6, jumpStrength: -11, isJumping: false });
  const obstaclesRef = useRef<{x: number, y: number, width: number, height: number}[]>([]);
  const frameRef = useRef(0);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    dinoRef.current = { x: 50, y: 150, width: 40, height: 40, velocityY: 0, gravity: 0.6, jumpStrength: -11, isJumping: false };
    obstaclesRef.current = [];
    frameRef.current = 0;
    setIsPlaying(true);
  };

  const jump = useCallback(() => {
    if (!dinoRef.current.isJumping && !gameOver) {
      dinoRef.current.velocityY = dinoRef.current.jumpStrength;
      dinoRef.current.isJumping = true;
      if (!isPlaying) setIsPlaying(true);
    }
  }, [gameOver, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameOver) resetGame();
        else jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, jump]);

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (gameOver) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Physics
      const dino = dinoRef.current;
      dino.velocityY += dino.gravity;
      dino.y += dino.velocityY;

      // Ground collision
      if (dino.y >= 150) {
        dino.y = 150;
        dino.velocityY = 0;
        dino.isJumping = false;
      }

      // Draw Dino (Dragon)
      ctx.fillStyle = '#b91c1c'; // primary red
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(dino.x + 25, dino.y + 5, 5, 5); // eye

      // Obstacles
      if (frameRef.current % 90 === 0) {
        obstaclesRef.current.push({
          x: canvas.width,
          y: 160,
          width: 20,
          height: 30
        });
      }

      for (let i = 0; i < obstaclesRef.current.length; i++) {
        const obs = obstaclesRef.current[i];
        obs.x -= 6;
        ctx.fillStyle = '#1f2937'; // gray
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision detection
        if (
          dino.x < obs.x + obs.width &&
          dino.x + dino.width > obs.x &&
          dino.y < obs.y + obs.height &&
          dino.y + dino.height > obs.y
        ) {
          setGameOver(true);
          if (score > highScore) setHighScore(score);
        }
      }

      // Cleanup offscreen obstacles
      if (obstaclesRef.current.length > 0 && obstaclesRef.current[0].x < -50) {
        obstaclesRef.current.shift();
      }

      // Draw Ground
      ctx.beginPath();
      ctx.moveTo(0, 190);
      ctx.lineTo(canvas.width, 190);
      ctx.strokeStyle = '#e5e7eb';
      ctx.stroke();

      setScore(prev => prev + 1);
      frameRef.current++;
      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, gameOver, score, highScore]);

  return (
    <div className="flex flex-col items-center mt-12 w-full max-w-2xl mx-auto px-4">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Play while you wait!</h3>
      <p className="text-sm text-gray-500 mb-6">Press Space or Tap the box to jump</p>
      
      <div 
        className="relative w-full border-2 border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-inner cursor-pointer" 
        style={{ height: '200px' }} 
        onClick={() => { if(gameOver) resetGame(); else jump(); }}
      >
        <canvas ref={canvasRef} width={600} height={200} className="w-full h-full block object-cover" />
        
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <button className="px-8 py-3 bg-primary-600 text-white rounded-full font-bold shadow-lg hover:bg-primary-700 transition hover:scale-105 active:scale-95" onClick={(e) => { e.stopPropagation(); resetGame(); }}>
              Start Game
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <h4 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">GAME OVER</h4>
            <p className="text-gray-600 font-medium mb-6">Score: {score} &nbsp;|&nbsp; High Score: {highScore}</p>
            <button className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold shadow-lg hover:bg-black transition hover:scale-105 active:scale-95" onClick={(e) => { e.stopPropagation(); resetGame(); }}>
              Play Again
            </button>
          </div>
        )}
        
        <div className="absolute top-4 right-6 text-gray-400 font-mono font-bold text-sm select-none tracking-widest">
          HI {highScore.toString().padStart(5, '0')} {score.toString().padStart(5, '0')}
        </div>
      </div>
    </div>
  );
};

const StoreClosed: React.FC<StoreClosedProps> = ({ reopenDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!reopenDate) {
      setIsReady(true);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(reopenDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
      setIsReady(true);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [reopenDate]);

  if (!isReady) return null;

  const hasTimer = reopenDate && new Date(reopenDate).getTime() > new Date().getTime();

  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden py-8">
      {/* Background Image Composition */}
      <div className="absolute inset-0 z-0 bg-black">
        <img 
          src="/images/hero/nattukozhi_bg.png" 
          alt="Nattukozhi Special" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <img 
          src="https://images.unsplash.com/photo-1615719413546-198b25453f85?w=1600&q=80" 
          alt="Vegetables" 
          className="absolute inset-0 w-full h-full object-cover object-left"
          style={{ maskImage: 'linear-gradient(to right, black 15%, transparent 35%)', WebkitMaskImage: 'linear-gradient(to right, black 15%, transparent 35%)' }}
        />
        {/* Brand Red & Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-primary-900/90 to-black/80"></div>
      </div>

      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-2 italic drop-shadow-lg leading-tight">
          Elai Virundhu & Cafe
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-primary-100 mb-6 sm:mb-8 font-medium drop-shadow-md">
          We are temporarily closed.
        </p>
        
        {hasTimer ? (
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 bg-black/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl max-w-[95%] mb-8 sm:mb-12">
            <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
              <div className="text-3xl sm:text-5xl font-black text-white mb-1 drop-shadow-lg">{timeLeft.days}</div>
              <span className="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Days</span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white/50 mt-1 hidden sm:block">:</div>
            <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
              <div className="text-3xl sm:text-5xl font-black text-white mb-1 drop-shadow-lg">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <span className="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Hours</span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white/50 mt-1 hidden sm:block">:</div>
            <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
              <div className="text-3xl sm:text-5xl font-black text-white mb-1 drop-shadow-lg">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <span className="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Minutes</span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white/50 mt-1 hidden sm:block">:</div>
            <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
              <div className="text-3xl sm:text-5xl font-black text-white mb-1 drop-shadow-lg">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <span className="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Seconds</span>
            </div>
          </div>
        ) : (
          <div className="px-8 py-3 bg-white text-primary-600 font-extrabold text-lg rounded-full shadow-xl mb-8 sm:mb-12">
            Opening soon!
          </div>
        )}

        <div className="w-full max-w-lg mx-auto bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/20 shadow-2xl">
          <DragonGame />
        </div>
      </div>
    </div>
  );
};

export default StoreClosed;
