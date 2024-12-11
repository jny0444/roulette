import { motion } from "framer-motion";

export default function MobileWarning() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-neutral-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-neutral-800 p-6 rounded-xl border-2 border-white max-w-sm"
      >
        <h2 className="text-white font-mono font-bold text-xl mb-4">
          Device Not Supported
        </h2>
        <p className="text-white font-mono">
          This application is designed for desktop use only. Please access it
          from a computer for the best experience.
        </p>
      </motion.div>
    </div>
  );
}
