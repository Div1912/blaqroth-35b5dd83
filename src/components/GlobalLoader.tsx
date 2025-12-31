import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoaderProps {
  isLoading: boolean;
}

export const GlobalLoader = ({ isLoading }: GlobalLoaderProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Logo */}
            <motion.h1
              className="font-display text-4xl md:text-6xl tracking-[0.3em] text-gold-gradient"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              BLAQROTH
            </motion.h1>
            
            {/* Subtle line animation */}
            <motion.div
              className="mt-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"
              style={{ width: '120px' }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scaleX: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
