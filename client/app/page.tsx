"use client";
import dynamic from 'next/dynamic';
import Disclaimer from "@/components/Disclaimer";
import MobileWarning from "@/components/MobileWarning";
import Navbar from "@/components/Navbar";
import { GameProvider, useGame } from "@/context/GameContext";

const Roulette = dynamic(() => import("@/components/Roulette"), {
  ssr: false,
});

function HomeContent() {
  const { disclaimerAccepted, isMobile } = useGame();

  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <div>
      <Disclaimer />
      {disclaimerAccepted && (
        <>
          <Navbar />
          <div
            id="wheel"
            className="flex flex-row justify-center items-center min-h-screen py-40"
          >
            <Roulette />
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <HomeContent />
    </GameProvider>
  );
}
