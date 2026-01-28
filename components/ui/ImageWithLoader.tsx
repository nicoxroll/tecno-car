import React, { useState, useRef, useEffect } from 'react';

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

const ParticleLoader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let animationId: number;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const resize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
      }
    };
    
    // Initial size
    resize();
    
    // Observer for resize since it's inside a container, not window
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement!);

    const particles: any[] = [];
    // Adjust density based on size
    const particleCount = Math.max(Math.min(Math.floor((width * height) / 5000), 50), 10); 

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() + 0.5
        });
    }

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        
        // Update particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        });

        // Draw connections
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            
            // Mouse interaction
            const dxMouse = mouseX - p1.x;
            const dyMouse = mouseY - p1.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            
            if (distMouse < 150) {
                 ctx.beginPath();
                 ctx.moveTo(p1.x, p1.y);
                 ctx.lineTo(mouseX, mouseY);
                 ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distMouse / 150)})`;
                 ctx.stroke();
            }

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist / 100)})`;
                    ctx.stroke();
                }
            }
        }
        
        animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="w-full h-full bg-zinc-900/50 absolute top-0 left-0"
    />
  );
};

export const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ 
  src, 
  alt, 
  className, 
  containerClassName,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName || ''}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900">
           <ParticleLoader />
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
            setHasError(true);
            setIsLoaded(true); // Hide loader on error
        }}
        {...props}
      />
    </div>
  );
};
