import React, { useEffect, useRef } from 'react';

const BackgroundGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // State for the simulation
    let width = 0;
    let height = 0;
    
    // Configuration
    const pointSpacing = 10; // Pixels between points
    const speed = 0.5; // Pixels per frame - SLOW MOMENTUM
    let offset = 0;

    // Data Arrays
    const dataPoints: {
      price: number;
      ma: number;
      rsi: number;
    }[] = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Fill initial data
      const numPoints = Math.ceil(width / pointSpacing) + 5;
      dataPoints.length = 0;

      // Initial Values
      let price = height * 0.5; // Start in exact middle
      let ma = price;
      let rsi = 50;

      for (let i = 0; i < numPoints; i++) {
        // Price Random Walk
        const change = (Math.random() - 0.5) * 15;
        price += change;
        // Keep price within reasonable bounds (Middle section: 25% to 75%)
        if (price < height * 0.25) price += 5;
        if (price > height * 0.75) price -= 5;

        // MA (Simple smoothing / Lagging indicator)
        ma = ma * 0.9 + price * 0.1;

        // RSI Simulation (Bounded 0-100 concept)
        const rsiChange = (Math.random() - 0.5) * 10;
        rsi += rsiChange;
        rsi += (50 - rsi) * 0.05; // Pull back to center

        dataPoints.push({ price, ma, rsi });
      }
    };

    init();

    const resize = () => {
      init();
    };
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // --- UPDATE DATA ---
      offset += speed;
      if (offset >= pointSpacing) {
        offset -= pointSpacing;
        dataPoints.shift();

        // Generate New Point based on last point
        const last = dataPoints[dataPoints.length - 1];
        
        // Price
        let price = last.price + (Math.random() - 0.5) * 15;
        // Constraints (Middle section: 25% to 75%)
        if (price < height * 0.25) price += 2;
        if (price > height * 0.75) price -= 2;

        // MA
        const ma = last.ma * 0.95 + price * 0.05;

        // RSI
        let rsi = last.rsi + (Math.random() - 0.5) * 8;
        rsi += (50 - rsi) * 0.05; // Pull to center

        dataPoints.push({ price, ma, rsi });
      }

      // --- DRAWING ---

      // 1. PRICE CHART (Middle Section)
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#06b6d4'; // Cyan-500
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      
      for (let i = 0; i < dataPoints.length - 1; i++) {
        const x1 = i * pointSpacing - offset;
        const y1 = dataPoints[i].price;
        const x2 = (i + 1) * pointSpacing - offset;
        const y2 = dataPoints[i+1].price;
        
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        
        if (i === 0) ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(x1, y1, cx, cy);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; 

      // 2. MOVING AVERAGE (Overlay on Price)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b'; // Amber-500
      
      for (let i = 0; i < dataPoints.length - 1; i++) {
        const x = i * pointSpacing - offset;
        const y = dataPoints[i].ma;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();


      // 3. RSI (Bottom Section)
      // Moved down since MACD is gone. e.g. 85% to 95%
      const rsiTop = height * 0.85;
      const rsiBottom = height * 0.95;
      const rsiHeight = rsiBottom - rsiTop;
      
      // RSI Reference Lines
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      const y70 = rsiBottom - 0.7 * rsiHeight;
      const y30 = rsiBottom - 0.3 * rsiHeight;
      ctx.moveTo(0, y70); ctx.lineTo(width, y70);
      ctx.moveTo(0, y30); ctx.lineTo(width, y30);
      ctx.stroke();

      // RSI Line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#d946ef'; // Fuchsia-500
      
      for (let i = 0; i < dataPoints.length - 1; i++) {
        const x = i * pointSpacing - offset;
        const rsiVal = Math.max(0, Math.min(100, dataPoints[i].rsi));
        const y = rsiBottom - (rsiVal / 100) * rsiHeight;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }} />;
};

export default BackgroundGraph;