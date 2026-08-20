import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { PhysicsLetter, GroundLine } from '../types';
import { audio } from '../utils/audio';

interface PhysicsCanvasProps {
  gravity: number;
  wind: number;
  bounceMultiplier: number;
  letterLife: number; // in frames
  colorPalette: 'neon' | 'cyberpunk' | 'pastel' | 'cosmic';
  onLetterCountChange?: (count: number) => void;
}

export interface PhysicsCanvasHandle {
  addLetter: (char: string) => void;
  triggerExplosion: (x: number, y: number) => void;
  clearLetters: () => void;
}

const PALETTES = {
  neon: {
    a: { fill: '#ff003c', glow: '#ff003c' },
    r: { fill: '#00f6ff', glow: '#00f6ff' },
    k: { fill: '#ffea00', glow: '#ffea00' },
    s: { fill: '#a020f0', glow: '#a020f0' },
    other: ['#39ff14', '#fe019a', '#17becf', '#ff7f0e', '#bcbd22']
  },
  cyberpunk: {
    a: { fill: '#ff0055', glow: '#ff0055' },
    r: { fill: '#00ffcc', glow: '#00ffcc' },
    k: { fill: '#ffcc00', glow: '#ffcc00' },
    s: { fill: '#9900ff', glow: '#9900ff' },
    other: ['#ff5e00', '#0099ff', '#ff00aa', '#22ff00']
  },
  pastel: {
    a: { fill: '#ffb3ba', glow: '#ffb3ba' },
    r: { fill: '#baffc9', glow: '#baffc9' },
    k: { fill: '#ffffba', glow: '#ffffba' },
    s: { fill: '#bae1ff', glow: '#bae1ff' },
    other: ['#ffc6ff', '#e8aeff', '#ffd3b6', '#a8e6cf']
  },
  cosmic: {
    a: { fill: '#e0f7fa', glow: '#00e5ff' },
    r: { fill: '#f3e5f5', glow: '#d500f9' },
    k: { fill: '#fffde7', glow: '#ffea00' },
    s: { fill: '#ede7f6', glow: '#6200ea' },
    other: ['#fce4ec', '#f1f8e9', '#e8f5e9', '#ffe0b2']
  }
};

export const PhysicsCanvas = forwardRef<PhysicsCanvasHandle, PhysicsCanvasProps>(({
  gravity,
  wind,
  bounceMultiplier,
  letterLife,
  colorPalette,
  onLetterCountChange
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lettersRef = useRef<PhysicsLetter[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  // Dimensions
  const [size, setSize] = useState({ width: 800, height: 600 });
  
  // Custom Bouncy Obstacles/Ground Lines
  const [bouncyLines, setBouncyLines] = useState<GroundLine[]>([]);
  
  // Interactive Explosion Wave State (just for visual representation in anim loop)
  const explosionsRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; opacity: number }[]>([]);

  // Update canvas size safely using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const boundedHeight = Math.max(height, 500);
        setSize({ width, height: boundedHeight });
        
        // Define default geometric bouncy bumper platforms when size changes
        setBouncyLines([
          // High-tech glowing visual platforms
          { x1: width * 0.15, y1: boundedHeight * 0.45, x2: width * 0.4, y2: boundedHeight * 0.5 },
          { x1: width * 0.6, y1: boundedHeight * 0.35, x2: width * 0.85, y2: boundedHeight * 0.4 },
          { x1: width * 0.3, y1: boundedHeight * 0.7, x2: width * 0.7, y2: boundedHeight * 0.65 }
        ]);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Expose triggers outwards
  useImperativeHandle(ref, () => ({
    addLetter: (char: string) => {
      const p = PALETTES[colorPalette];
      const lower = char.toLowerCase();
      let color = '';
      let glowColor = '';
      
      const isSpecial = ['a', 'r', 'k', 's'].includes(lower);

      if (isSpecial) {
        const choice = p[lower as 'a'|'r'|'k'|'s'];
        color = choice.fill;
        glowColor = choice.glow;
      } else {
        const rndColor = p.other[Math.floor(Math.random() * p.other.length)];
        color = rndColor;
        glowColor = rndColor;
      }

      const sizeDivider = isSpecial ? 1.6 : 2.5;
      const initialSize = Math.floor(Math.random() * 25) + 30; // Letter px size

      const newLetter: PhysicsLetter = {
        id: Math.random().toString(36).substr(2, 9),
        char,
        // Spawn slightly clustered near top-center or randomly around top wide region
        x: size.width * 0.2 + Math.random() * (size.width * 0.6),
        y: -50, // start above view
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 5 + 3,
        angle: Math.random() * Math.PI * 2,
        vangle: (Math.random() - 0.5) * 0.1,
        size: initialSize,
        color,
        glowColor,
        opacity: 1,
        life: 1.0,
        maxLife: letterLife
      };

      lettersRef.current.push(newLetter);
      if (onLetterCountChange) {
        onLetterCountChange(lettersRef.current.length);
      }
    },
    triggerExplosion: (x: number, y: number) => {
      spawnForcefield(x, y);
    },
    clearLetters: () => {
      lettersRef.current = [];
      if (onLetterCountChange) {
        onLetterCountChange(0);
      }
    }
  }));

  const spawnForcefield = (x: number, y: number) => {
    // Add visual ripple
    explosionsRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: 180,
      opacity: 1.0
    });

    // Play explosion sweep synth
    audio.playExplosion();

    // Push letters in radius away
    const forceStrength = 15;
    lettersRef.current.forEach((letter) => {
      const dx = letter.x - x;
      const dy = letter.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 220) {
        // Linear drop off force
        const pct = (220 - dist) / 220;
        const pushForce = pct * forceStrength;
        const angle = dist > 0 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
        
        letter.vx += Math.cos(angle) * pushForce;
        letter.vy += Math.sin(angle) * pushForce;
        // give it a spin booster
        letter.vangle += (Math.random() - 0.5) * 0.5;
      }
    });
  };

  // Main rendering loop containing gravity, collision with bounding box, platform bounds, and inter-letter bounces
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrame: number;

    const updateLoop = () => {
      // Clear with dark, subtle transparency trails to create lovely movement trace!
      ctx.fillStyle = 'rgba(10, 10, 15, 0.22)';
      ctx.fillRect(0, 0, size.width, size.height);

      // --- 1. Draw glowing platforms ---
      bouncyLines.forEach((line) => {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 246, 255, 0.4)';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f6ff';
        
        // Draw the platform bar
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();

        // Draw cute anchor caps
        ctx.fillStyle = '#00f6ff';
        ctx.beginPath();
        ctx.arc(line.x1, line.y1, 5, 0, Math.PI * 2);
        ctx.arc(line.x2, line.y2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // --- 2. Update and draw Shockwave Ripples ---
      explosionsRef.current = explosionsRef.current.filter((exp) => {
        exp.radius += (exp.maxRadius - exp.radius) * 0.12;
        exp.opacity -= 0.04;
        
        if (exp.opacity > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(160, 32, 240, ${exp.opacity})`;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#a020f0';
          ctx.beginPath();
          ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          return true;
        }
        return false;
      });

      // --- 3. Physics Updates & Constraints ---
      const letters = lettersRef.current;
      const radiusOffsetFactor = 0.42; // standard letter bounding sizing multiplier

      letters.forEach((letter, index) => {
        // Fall speed with air friction
        letter.vy += gravity * 0.144;
        letter.vx += wind * 0.05;
        letter.vx *= 0.985; // air resistance
        letter.vy *= 0.985;

        letter.x += letter.vx;
        letter.y += letter.vy;
        letter.angle += letter.vangle;
        letter.vangle *= 0.98; // rotational dampening

        const radius = letter.size * radiusOffsetFactor;

        // Collision: Canvas floor/walls
        // Floor limit
        if (letter.y + radius > size.height) {
          letter.y = size.height - radius;
          letter.vy = -Math.abs(letter.vy) * bounceMultiplier;
          letter.vangle += (Math.random() - 0.5) * 0.05;
          // sound trigger if hard impact
          if (Math.abs(letter.vy) > 2) {
            audio.playKey(letter.char);
          }
        }
        // Ceil limit (bounce top if propelled upwards)
        if (letter.y - radius < -100) {
          // allow spawn offscreen, but reflect if high blast
          if (letter.vy < -10) {
            letter.vy = Math.abs(letter.vy) * 0.5;
          }
        }
        // Left wall
        if (letter.x - radius < 0) {
          letter.x = radius;
          letter.vx = Math.abs(letter.vx) * bounceMultiplier;
          letter.vangle += 0.03;
        }
        // Right wall
        if (letter.x + radius > size.width) {
          letter.x = size.width - radius;
          letter.vx = -Math.abs(letter.vx) * bounceMultiplier;
          letter.vangle -= 0.03;
        }

        // --- Collision: Bouncy sound bumpers/platforms ---
        bouncyLines.forEach((line) => {
          // Check line segment collision
          const ldx = line.x2 - line.x1;
          const ldy = line.y2 - line.y1;
          const lineLengthSq = ldx * ldx + ldy * ldy;
          if (lineLengthSq === 0) return;

          // Projection parameter t
          let t = ((letter.x - line.x1) * ldx + (letter.y - line.y1) * ldy) / lineLengthSq;
          t = Math.max(0, Math.min(1, t)); // clamp to line segment limits

          // Closest point on line
          const cx = line.x1 + t * ldx;
          const cy = line.y1 + t * ldy;

          // Compute distance to line segment
          const dx = letter.x - cx;
          const dy = letter.y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < radius + 4) {
            // Push letter outside platform boundary
            const angle = Math.atan2(dy, dx);
            letter.x = cx + Math.cos(angle) * (radius + 6);
            letter.y = cy + Math.sin(angle) * (radius + 6);

            // Reflect velocity along collision normal (normal is [cos(angle), sin(angle)])
            const normalX = Math.cos(angle);
            const normalY = Math.sin(angle);
            const dotProduct = letter.vx * normalX + letter.vy * normalY;

            // Reflect formula: V_new = V - (1 + e) * (V . N) * N
            const bounceElasticity = bounceMultiplier + 0.15; // slightly extra springiness
            letter.vx = letter.vx - (1 + bounceElasticity) * dotProduct * normalX;
            letter.vy = letter.vy - (1 + bounceElasticity) * dotProduct * normalY;

            // Apply friction/tangential drift to rotation
            letter.vangle += (letter.vx * normalY - letter.vy * normalX) * 0.005;

            // Play synth chord trigger
            if (Math.abs(dotProduct) > 1.2) {
              audio.playKey(letter.char);
            }
          }
        });

        // --- Collision: Inter-letter elastic collisions ---
        for (let j = index + 1; j < letters.length; j++) {
          const second = letters[j];
          const secondRadius = second.size * radiusOffsetFactor;
          
          const dx = second.x - letter.x;
          const dy = second.y - letter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = radius + secondRadius;

          if (dist < minDist) {
            // Penetration resolution
            const overlap = minDist - dist;
            const normX = dx / (dist || 1);
            const normY = dy / (dist || 1);

            // Move apart evenly based on their size differences
            letter.x -= normX * overlap * 0.5;
            letter.y -= normY * overlap * 0.5;
            second.x += normX * overlap * 0.5;
            second.y += normY * overlap * 0.5;

            // Relative velocity
            const rvx = second.vx - letter.vx;
            const rvy = second.vy - letter.vy;

            // Velocity along collision normal
            const velAlongNormal = rvx * normX + rvy * normY;

            // Only resolve if velocities are moving towards each other
            if (velAlongNormal < 0) {
              const impulseScalar = -(1 + bounceMultiplier) * velAlongNormal;
              // Equal mass approximation to keep bounce energy high
              const impulseX = impulseScalar * normX * 0.5;
              const impulseY = impulseScalar * normY * 0.5;

              letter.vx -= impulseX;
              letter.vy -= impulseY;
              second.vx += impulseX;
              second.vy += impulseY;

              // Shuffle rotation values
              const spinShift = (Math.random() - 0.5) * 0.08;
              letter.vangle += spinShift;
              second.vangle -= spinShift;
            }
          }
        }

        // Decay letter life
        letter.life -= 1.0 / letter.maxLife;
        if (letter.life < 0) {
          letter.life = 0;
        }
      });

      // Filter out completed/faded letters
      const currentCount = lettersRef.current.length;
      lettersRef.current = lettersRef.current.filter((l) => l.life > 0.01);
      
      if (onLetterCountChange && lettersRef.current.length !== currentCount) {
        onLetterCountChange(lettersRef.current.length);
      }

      // --- 4. Render Letters ---
      lettersRef.current.forEach((letter) => {
        ctx.save();
        ctx.translate(letter.x, letter.y);
        ctx.rotate(letter.angle);

        // Compute styling
        const isA = ['a','A'].includes(letter.char);
        const isR = ['r','R'].includes(letter.char);
        const isK = ['k','K'].includes(letter.char);
        const isS = ['s','S'].includes(letter.char);

        // Letter color with fadeout linear opacity
        ctx.fillStyle = letter.color;
        ctx.globalAlpha = Math.min(1.0, letter.life * 2.5);

        // Set rich ambient shadows for letters
        ctx.shadowBlur = (isA || isR || isK || isS) ? 22 : 8;
        ctx.shadowColor = letter.glowColor;

        // Display font style: Space Grotesk/monospace style for characters
        ctx.font = `bold ${letter.size}px "Space Grotesk", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(letter.char, 0, 0);

        // Add small retro bounding dots if special letters a, r, k, s
        if (isA || isR || isK || isS) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(0, 0, (letter.size * radiusOffsetFactor) + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      });

      localFrame = requestAnimationFrame(updateLoop);
    };

    localFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(localFrame);
  }, [size, gravity, wind, bounceMultiplier, letterLife, bouncyLines, colorPalette]);

  // Handle Canvas Mouse Clicks to Spawn Explosive Ripped Shockwaves
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    spawnForcefield(x, y);
  };

  return (
    <div 
      className="relative w-full h-full min-h-[500px] select-none rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all"
      ref={containerRef}
      id="physics-canvas-container"
    >
      {/* Absolute Header with Status/Toggles */}
      <div className="absolute top-4 left-4 z-10 flex gap-2" id="canvas-badges">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-mono text-cyan-400 border border-cyan-500/20 shadow-inner">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          60 FPS ACTIVE
        </span>
        <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-mono text-fuchsia-400 border border-fuchsia-500/20">
          GRAVITY: {gravity.toFixed(1)} / S
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10" id="canvas-help">
        <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-mono text-slate-400 border border-slate-800/80">
          CLICK CANVAS TO SPAWN SHOCKWAVES
        </span>
      </div>

      {lettersRef.current.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-6" id="empty-state">
          <p className="text-sm font-mono text-slate-500 uppercase tracking-widest animate-pulse mb-2">
            Waiting for keyboard mashing
          </p>
          <p className="text-xs text-slate-600 max-w-xs">
            Start typing on your keyboard or press automated mash presets below to hear the synth generate ambient beats.
          </p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair"
        id="gravity-render-surface"
      />
    </div>
  );
});

PhysicsCanvas.displayName = 'PhysicsCanvas';
