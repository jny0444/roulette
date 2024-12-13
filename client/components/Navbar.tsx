import { FaVolumeUp, FaVolumeMute, FaForward } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { connectWallet } from "@/utils/apiFeature";

export default function Navbar() {
  const [volume, setVolume] = useState(0.3); // Changed from 1 to 0.3
  const [previousVolume, setPreviousVolume] = useState(0.3);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [message, setMessage] = useState('Connect Wallet')

  const tracks = [
    "/Tracks/Track1.mp3",
    "/Tracks/Track2.mp3",
    "/Tracks/Track3.mp3",
    "/Tracks/Track4.mp3",
  ];

  const checkIfConnected = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setMessage(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
            } else {
                setMessage('Connect Wallet');
            }
        } catch (err) {
            console.error("Error checking wallet connection:", err);
            setMessage('Connect Wallet');
        }
    }
  }
  
  useEffect(() => {
    checkIfConnected();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setMessage(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      } else {
        setMessage('Connect Wallet');
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [])

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
    <div className="fixed z-40 left-0 right-0 top-0 flex flex-row justify-between items-center bg-gradient-to-tr from-neutral-300 to-neutral-700 px-8 py-4 border-b-4 border-black rounded-b-3xl select-none">
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
        <button className="font-mono text-white text-xl bg-black hover:bg-gradient-to-tr from-black to-neutral-700 px-4 py-2 rounded-lg border-2 border-black duration-200 hover:border-white" onClick={connectWallet}>
          {message}
        </button>
      </div>
    </div>
  );
}
