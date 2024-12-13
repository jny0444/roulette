"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Wheel } from "react-custom-roulette";
import { motion } from "framer-motion";
import { data } from "./rouletteData";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

const pointerAnimation = keyframes`
  0%, 100% {
    transform: scale(0.25) rotate(-131deg);
  }
  50% {
    transform: scale(0.25) rotate(-136deg);
  }
`;

const StyledPointer = styled.img`
  position: absolute;
  top: -14rem;
  left: 19rem;
  z-index: 10;
  transform: scale(0.25) rotate(-131deg);
  transform-origin: center;

  &.animate-pointer {
    animation: ${pointerAnimation} 0.8s ease-in-out infinite;
  }
`;

export default () => {
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const betClickSoundRef = useRef<HTMLAudioElement | null>(null);

  const getRouletteColor = (num: number) => {
    if (num === 0) return "bg-[#008000]";
    const redNumbers = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    return redNumbers.includes(num) ? "bg-[#ff0000]" : "bg-black";
  };

  const getNumberOpacity = (num: number) => {
    if (hoveredNumber === null || isSpinning) return "opacity-100 blur-none";
    return hoveredNumber === num
      ? "opacity-100 blur-none"
      : "opacity-30 blur-[1px]";
  };

  const handleSpinClick = useCallback(() => {
    if (!mustSpin && !isSpinning) {
      setShowConfirmation(true);
    }
  }, [mustSpin, isSpinning]);

  const playSpinSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const stopSpinSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleConfirmedSpin = () => {
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setIsSpinning(true);
    setShowConfirmation(false);
    playSpinSound();
  };

  const handleNumberSelect = useCallback(
    (num: number) => {
      if (!isSpinning) {
        setSelectedNumber(num);
        playClickSound();
      }
    },
    [isSpinning]
  );

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setBetAmount(Math.min(Math.max(value, 1), 5));
    }
  };

  const adjustBetAmount = (increment: boolean) => {
    setBetAmount((prev) => {
      const newValue = Math.min(
        Math.max(increment ? prev + 1 : prev - 1, 1),
        5
      );
      if (newValue !== prev) {
        playBetClickSound();
      }
      return newValue;
    });
  };

  const EmojiExplosion = ({ won }: { won: boolean }) => {
    const emojis = won
      ? ["🎉", "🎊", "💰", "🌟", "✨"]
      : ["😢", "💔", "😭", "🤔"];
    return (
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 45 }}
      >
        {Array.from({ length: won ? 100 : 40 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 1,
              scale: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: 0,
              scale: won ? 2 : 1.5,
              x: (Math.random() - 0.5) * 1200,
              y: (Math.random() - 0.5) * 1000,
              rotate: Math.random() * 720 - 360,
            }}
            transition={{
              duration: 3,
              ease: "easeOut",
              delay: Math.random() * 0.5,
            }}
            className="absolute text-4xl"
          >
            {emojis[Math.floor(Math.random() * emojis.length)]}
          </motion.div>
        ))}
      </div>
    );
  };

  const playResultSound = (won: boolean) => {
    const soundRef = won ? winSoundRef : loseSoundRef;
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(() => {});
    }
  };

  const Modal = () => {
    const winningNumber = parseInt(data[prizeNumber].option);
    const won = selectedNumber === winningNumber;

    useEffect(() => {
      if (showModal) {
        playResultSound(won);
      }
    }, [showModal]);

    return (
      showModal && (
        <>
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="select-none fixed z-40 inset-0 bg-black bg-opacity-70"
          />
          <EmojiExplosion won={won} />
          <motion.div
            key="modal-content"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="fixed z-50 inset-0 flex items-center justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
              }}
              className="bg-gradient-to-tr from-neutral-900 to-neutral-800 p-8 w-[400px] rounded-xl border-2 border-white"
            >
              <h2 className="text-white font-mono font-bold text-2xl mb-6">
                Results
              </h2>
              <div className="font-mono font-bold text-lg">
                <div className="flex justify-between items-center gap-5">
                  <p className="text-white">Your bet: </p>
                  <span
                    className={`${getRouletteColor(
                      selectedNumber
                    )} w-12 py-1 rounded text-white text-center`}
                  >
                    {selectedNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-5 mt-2">
                  <p className="text-white">Winning number: </p>
                  <span
                    className={`${getRouletteColor(
                      winningNumber
                    )} w-12 py-1 rounded text-white text-center`}
                  >
                    {winningNumber}
                  </span>
                </div>
                <p
                  className={`text-2xl mt-6 font-bold text-center whitespace-nowrap ${
                    won ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {won ? "Congratulations !!" : "Better luck next time"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full font-mono text-white text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 px-4 py-2 rounded-lg border-2 border-black duration-200 hover:border-white"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </>
      )
    );
  };

  const ConfirmationModal = () =>
    showConfirmation && (
      <motion.div
        key="confirm-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="select-none fixed z-50 inset-0 bg-black bg-opacity-70 flex items-center justify-center"
      >
        <motion.div
          key="confirm-content"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
          }}
          className="bg-gradient-to-tr from-neutral-900 to-neutral-800 p-8 rounded-xl border-2 border-white"
        >
          <h2 className="text-white font-mono font-bold text-2xl mb-6">
            Confirm Bet
          </h2>
          <div className="flex items-center gap-2 text-white font-mono font-bold text-lg mb-6">
            <p>
              Are you sure you want to bet
              <br />
              <span className="mr-2 px-1 bg-white text-black rounded">
                {betAmount}
              </span>
              LINK token on number
              <span
                className={`${getRouletteColor(
                  selectedNumber
                )} mx-2 px-1 rounded`}
              >
                {selectedNumber}
              </span>
              ?
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleConfirmedSpin}
              className="flex-1 font-mono text-white text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 px-4 py-2 rounded-lg border-2 border-black duration-200 hover:border-white"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 font-mono text-white text-xl bg-red-700 hover:bg-gradient-to-tr from-red-600 to-red-500 px-4 py-2 rounded-lg border-2 border-red-700 duration-200 hover:border-white"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    );

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(() => {});
    }
  };

  const playBetClickSound = () => {
    if (betClickSoundRef.current) {
      betClickSoundRef.current.currentTime = 0;
      betClickSoundRef.current.play().catch(() => {});
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 1.2,
            staggerChildren: 0.3,
            ease: "easeOut",
          },
        },
      }}
    >
      <audio ref={audioRef} src="/Sounds/wheel.mp3" preload="auto" />
      <audio ref={winSoundRef} src="/Sounds/win.mp3" preload="auto" />
      <audio ref={loseSoundRef} src="/Sounds/lose.mp3" preload="auto" />
      <audio ref={clickSoundRef} src="/Sounds/number.wav" preload="auto" />
      <audio ref={betClickSoundRef} src="/Sounds/bet.wav" preload="auto" />
      <div className="gap-10 xl:gap-20 flex flex-col xl:flex-row items-center justify-center">
        <motion.div
          className="relative"
          variants={{
            hidden: {
              opacity: 0,
              x: -100,
              rotate: -20,
            },
            visible: {
              opacity: 1,
              x: 0,
              rotate: 0,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                duration: 1.5,
              },
            },
          }}
        >
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            fontSize={18}
            perpendicularText={true}
            radiusLineColor={"white"}
            innerBorderColor={"white"}
            outerBorderColor={"white"}
            textDistance={85}
            innerRadius={60}
            outerBorderWidth={3}
            innerBorderWidth={2}
            radiusLineWidth={1}
            spinDuration={1.2}
            startingOptionIndex={0}
            pointerProps={{
              src: "/no.png",
              style: {
                opacity: 0,
              },
            }}
            onStopSpinning={() => {
              setMustSpin(false);
              setIsSpinning(false);
              stopSpinSound();
              setShowModal(true);
            }}
          />
          <StyledPointer
            src="/pointer.svg"
            className={`${
              isSpinning ? "animate-pointer" : ""
            } transition-all duration-300`}
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: {
              opacity: 0,
              y: 100,
              scale: 0.95,
            },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 90,
                duration: 1.5,
                delayChildren: 0.4,
                staggerChildren: 0.1,
              },
            },
          }}
          className={`flex flex-col items-center gap-8 transition-opacity duration-300 ${
            isSpinning ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  damping: 25,
                  stiffness: 100,
                },
              },
            }}
            className="font-mono flex"
          >
            <div className="border-y-2 border-l-2">
              <motion.button
                whileHover={{ scale: isSpinning ? 1 : 1.03 }}
                whileTap={{ scale: 1 }}
                onMouseEnter={() => !isSpinning && setHoveredNumber(0)}
                onMouseLeave={() => setHoveredNumber(null)}
                onClick={() => handleNumberSelect(0)}
                disabled={isSpinning}
                className={`w-[52px] h-full bg-[#008000] text-white flex items-center justify-center transition-all duration-200 ${
                  isSpinning ? "cursor-not-allowed" : "cursor-pointer"
                } ${getNumberOpacity(0)}`}
              >
                0
              </motion.button>
            </div>
            <table className="table-auto w-full text-center font-bold">
              <tbody>
                {[
                  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
                  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
                  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
                ].map((row, rowIndex) => (
                  <tr key={rowIndex} className="text-white">
                    {row.map((num) => (
                      <td key={num} className="border-2 p-0">
                        <motion.button
                          whileHover={{
                            scale: isSpinning ? 1 : 1.03,
                          }}
                          whileTap={{ scale: 1 }}
                          onMouseEnter={() =>
                            !isSpinning && setHoveredNumber(num)
                          }
                          onMouseLeave={() => setHoveredNumber(null)}
                          onClick={() => handleNumberSelect(num)}
                          disabled={isSpinning}
                          className={`w-full h-full px-4 py-2 ${getRouletteColor(
                            num
                          )} ${getNumberOpacity(
                            num
                          )} transition-all duration-200 text-white block ${
                            isSpinning ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          {num}
                        </motion.button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  damping: 25,
                  stiffness: 100,
                },
              },
            }}
            className="flex w-full justify-between items-center"
          >
            <label className="text-white font-mono font-bold select-none text-3xl">
              Placing bet on:{" "}
            </label>
            <input
              value={selectedNumber}
              readOnly
              className={`w-36 text-right border-2 rounded-xl text-white font-mono font-bold text-2xl px-4 py-2 outline-none ${getRouletteColor(
                selectedNumber
              )}`}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  damping: 25,
                  stiffness: 100,
                },
              },
            }}
            className="flex w-full justify-between items-center"
          >
            <label className="text-white font-mono font-bold select-none text-3xl">
              Bet amount:{" "}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustBetAmount(false)}
                className="p-2 text-white text-center font-mono font-bold text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 rounded-xl border-2 border-neutral-400 hover:border-white duration-200"
              >
                <FaMinus />
              </button>
              <input
                type="number"
                min="1"
                max="5"
                value={betAmount}
                onChange={handleBetAmountChange}
                className="selection:text-white text-center w-12 border-2 border-neutral-400 rounded-xl text-black font-mono font-bold text-2xl py-1.5 outline-none bg-white"
              />
              <button
                onClick={() => adjustBetAmount(true)}
                className="p-2 text-white text-center font-mono font-bold text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 rounded-xl border-2 border-neutral-400 hover:border-white duration-200"
              >
                <FaPlus />
              </button>
            </div>
          </motion.div>
          <motion.button
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  damping: 15,
                  stiffness: 120,
                  duration: 0.8,
                },
              },
            }}
            onClick={handleSpinClick}
            disabled={isSpinning}
            className={`w-48 font-mono text-white text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 px-4 py-2 rounded-lg border-2 border-black duration-200 ${
              isSpinning
                ? "opacity-20 cursor-not-allowed"
                : "hover:border-white cursor-pointer"
            }`}
          >
            {isSpinning ? "SPINNING..." : "SPIN"}
          </motion.button>
        </motion.div>
      </div>
      <Modal />
      <ConfirmationModal />
    </motion.div>
  );
};
