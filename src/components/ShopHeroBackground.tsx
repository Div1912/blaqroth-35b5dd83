import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ShopHeroBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Animated gradient orbs with parallax */}
      <motion.div
        style={{ y: y1, opacity, scale }}
        className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full"
      >
        <div 
          className="w-full h-full rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(38 45% 55% / 0.4) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      <motion.div
        style={{ y: y2, opacity }}
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
      >
        <div 
          className="w-full h-full rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(42 50% 70% / 0.35) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      <motion.div
        style={{ y: y3, opacity }}
        className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full"
      >
        <div 
          className="w-full h-full rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(35 40% 45% / 0.5) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Floating geometric shapes */}
      <motion.div
        animate={{
          rotate: [0, 360],
          y: [0, -20, 0],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute top-20 right-20 w-20 h-20 border border-primary/20 rotate-45"
      />

      <motion.div
        animate={{
          rotate: [0, -360],
          y: [0, 30, 0],
        }}
        transition={{
          rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
        }}
        className="absolute top-40 left-16 w-12 h-12 border border-primary/15 rounded-full"
      />

      <motion.div
        animate={{
          rotate: [45, 405],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
          scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute bottom-40 right-32 w-16 h-16 border border-primary/10"
      />

      {/* Diagonal lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="diagonal-lines" patternUnits="userSpaceOnUse" width="40" height="40">
            <path d="M-10,10 l20,-20 M0,40 l40,-40 M30,50 l20,-20" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
      </svg>

      {/* Gradient mesh overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, hsl(38 45% 55% / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, hsl(42 50% 70% / 0.06) 0%, transparent 50%)
          `,
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
