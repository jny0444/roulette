"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, backInOut } from "framer-motion";
import { useGame } from "@/context/GameContext";

export default function Disclaimer() {
  const [canAccept, setCanAccept] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { setDisclaimerAccepted } = useGame();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanAccept(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    setDisclaimerAccepted(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            className="bg-gradient-to-tr from-neutral-900 to-neutral-800 p-8 rounded-xl border-2 border-white max-w-md w-full mx-4"
          >
            <h2 className="text-white font-mono font-bold text-2xl mb-6">
              Disclaimer
            </h2>
            <p className="text-white font-mono mb-6 text-justify">
              This game involves an element of{" "}
              <span className="font-bold">financial risk</span> and may be{" "}
              <span className="font-bold">addictive</span>.
              <br />
              <br /> Please play RESPONSIBLY and at your own RISK.
              <br />
              <br /> By continuing, you acknowledge that real money is on the
              line.
            </p>
            <button
              onClick={handleAccept}
              disabled={!canAccept}
              className={`w-full font-mono text-white text-xl ${
                canAccept
                  ? "bg-black hover:bg-gradient-to-tr from-black to-neutral-700 border-2 border-black hover:border-white"
                  : "bg-neutral-700 border-2 border-neutral-700 cursor-not-allowed opacity-50"
              } px-4 py-2 rounded-lg duration-200`}
            >
              {canAccept ? "I Accept" : "Please wait..."}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
