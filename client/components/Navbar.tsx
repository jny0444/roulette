import { FaVolumeUp, FaVolumeMute, FaForward } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [volume, setVolume] = useState(0.3); // Changed from 1 to 0.3
  const [previousVolume, setPreviousVolume] = useState(0.3);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = [
    "/Tracks/Track1.mp3",
    "/Tracks/Track2.mp3",
    "/Tracks/Track3.mp3",
    "/Tracks/Track4.mp3",
  ];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(tracks[currentTrackIndex]);
      audioRef.current.loop = true;
      audioRef.current
        .play()
        .catch((error) => console.log("Audio autoplay failed:", error));
    } else {
      audioRef.current.src = tracks[currentTrackIndex];
      audioRef.current.play();
    }
    audioRef.current.volume = volume;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [currentTrackIndex]);

  const handleVolumeToggle = () => {
    if (volume === 0) {
      setVolume(previousVolume);
      if (audioRef.current) {
        audioRef.current.volume = previousVolume;
      }
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  const handleTrackChange = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      const nextTrackIndex = (currentTrackIndex + 1) % tracks.length;
      setCurrentTrackIndex(nextTrackIndex);
    }
  };

  return (
    <div className="fixed z-40 left-0 right-0 top-0 flex flex-row justify-between items-center bg-gradient-to-tr from-neutral-300 to-neutral-700 px-8 py-4 border-2 border-black rounded-b-3xl select-none">
      <h1 className="font-royal text-black font-black text-5xl">
        Rul-8 <span className="text-xl"> . </span>
        <span className="text-2xl font-serif font-normal text-black">
          /rʊˈlɛt/
        </span>
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={handleVolumeToggle}
          className="text-white text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 p-2 rounded-lg border-2 border-black duration-200 hover:border-white"
        >
          {volume === 0 ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
        </button>
        <button
          onClick={handleTrackChange}
          className="text-white text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 p-2 rounded-lg border-2 border-black duration-200 hover:border-white"
        >
          <FaForward size={24} />
        </button>
        <button className="font-mono text-white text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 px-4 py-2 rounded-lg border-2 border-black duration-200 hover:border-white">
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
