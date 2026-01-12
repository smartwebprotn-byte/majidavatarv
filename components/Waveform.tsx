
import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

export const Waveform: React.FC<{ active?: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioAnalyser, currentMode } = useStore();

  useEffect(() => {
    if (!canvasRef.current || !audioAnalyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      audioAnalyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / 40);
      let barHeight;
      let x = 0;

      for (let i = 0; i < 40; i++) {
        barHeight = (dataArray[i * 2] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (currentMode === 'TALKING') {
          gradient.addColorStop(0, '#60a5fa');
          gradient.addColorStop(1, '#1d4ed8');
        } else {
          gradient.addColorStop(0, '#3b82f644');
          gradient.addColorStop(1, '#3b82f611');
        }

        ctx.fillStyle = gradient;
        
        const centerY = canvas.height / 2;
        const h = Math.max(2, barHeight);
        
        // Arrondir les barres
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, centerY - h / 2, barWidth - 2, h, 2);
        } else {
          ctx.rect(x, centerY - h / 2, barWidth - 2, h);
        }
        ctx.fill();

        x += barWidth;
      }
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [audioAnalyser, currentMode]);

  return (
    <canvas 
      ref={canvasRef} 
      width={320} 
      height={48} 
      className={`w-full opacity-0 transition-opacity duration-1000 ${active ? 'opacity-100' : ''}`}
    />
  );
};
