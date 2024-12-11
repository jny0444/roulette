"use client";
import Disclaimer from "@/components/Disclaimer";
import MobileWarning from "@/components/MobileWarning";
import Navbar from "@/components/Navbar";
import Roulette from "@/components/Roulette";
import { GameProvider, useGame } from "@/context/GameContext";

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
            className="flex flex-row justify-center items-center h-screen"
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
