import React, { useState, useEffect, useRef } from 'react';
// Ensure App.css is imported if GameDiscovery is meant to use .fullscreen-component from it.
// Typically, App.css is imported in App.js. If these styles are global, it's fine.
// import './App.css'; // Or a specific CSS file for GameDiscovery if preferred

// Function to retrieve avatarId from localStorage
function getAvatarIdFromLocalStorage() {
  const playerDataString = localStorage.getItem('metagameGameState');
  if (playerDataString) {
    try {
      const playerData = JSON.parse(playerDataString);
      return playerData.playerDisplayAvatarId;
    } catch (error) {
      console.error("Error parsing playerData from localStorage:", error);
      return null; // Or a default avatarId
    }
  }
  return null; // Or a default avatarId if no data is found
}

function updateMoneyBalance(amount) {
  const playerDataString = localStorage.getItem('metagameGameState');
  if (playerDataString) {
    const playerData = JSON.parse(playerDataString);
    playerData.treats += amount;
    // Note: Save the updated playerData back to localStorage here
    localStorage.setItem('metagameGameState', JSON.stringify(playerData));
  }
}

const games = [
  {
    id: 'buckethat',
    title: 'Bucket Hat',
    srcPath: 'games/buckethat/index.html',
  },
  {
    id: 'blobderby',
    title: 'Blob Derby',
    srcPath: 'games/blobderby/index.html',
  },
  // Add more game objects here as needed
  // {
  //   id: 'newgame',
  //   title: 'New Game',
  //   srcPath: 'games/newgame/index.html',
  // },
];

function GameDiscovery() {
  const [avatarId, setAvatarId] = useState(null);
  // const [gameScore, setGameScore] = useState(null); // Kept for potential future use
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const id = getAvatarIdFromLocalStorage();
    if (id) {
      setAvatarId(id);
    } else {
      console.log("No avatarId found in localStorage or error parsing.");
      // Optionally, set a default avatarId here
    }

    const handleMessage = (event) => {
      // Basic origin check - replace with your actual origin in production
      // if (event.origin !== window.location.origin && event.origin !== 'null') {
      //   console.warn(`Received message from unexpected origin: ${event.origin}`);
      //   return;
      // }

      if (typeof event.data === 'object' && event.data.type === 'gameOver') {
        console.log("Received score object from iframe:", event.data);
        const score = event.data.fishScore; // Assuming fishScore is part of the gameOver event data
        updateMoneyBalance(score);
        // Potentially setGameScore(score) if you want to display it
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const avatarSuffix = avatarId ? `?avatarId=${avatarId}` : '';
  const currentGame = games[currentGameIndex];

  const goToPreviousGame = () => {
    setCurrentGameIndex((prevIndex) =>
      prevIndex === 0 ? games.length - 1 : prevIndex - 1
    );
  };

  const goToNextGame = () => {
    setCurrentGameIndex((prevIndex) =>
      prevIndex === games.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleTouchStart = (e) => {
    // Check if the touch target is the iframe itself
    if (iframeRef.current && e.target === iframeRef.current) {
      // If touch started on the iframe, do not process for swipe navigation.
      // Ensure swipe state is reset in case a previous swipe was aborted.
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }
    // If touch started outside the iframe, proceed with swipe detection.
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || touchStartY === null) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipeDistance = 50; // Minimum distance for a swipe

    // Check for swipe up
    if (deltaY < -minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
      goToNextGame();
    }

    // Reset touch start points
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div
      className="fullscreen-component game-discovery-screen"
      style={{
        backgroundColor: '#e8f0fe',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        padding: '20px 0',
        boxSizing: 'border-box',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <h2 style={{ flexShrink: 0, margin: '0 0 10px 0' }}>{currentGame.title}</h2>
      {/* Optional: Display current game score
      {gameScore !== null && (
        <h3>Game Score: {gameScore}</h3>
      )} */}

      <div style={{
        width: '95%',
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <iframe
          ref={iframeRef}
          src={`${currentGame.srcPath}${avatarSuffix}`}
          title={currentGame.title}
          id={`gameIframe-${currentGame.id}`}
          key={currentGame.id}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', flexShrink: 0 }}>
        <button
          onClick={goToPreviousGame}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Previous Game
        </button>
        <button
          onClick={goToNextGame}
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Next Game
        </button>
      </div>

      {/* Indicator for current game could be added here, e.g., dots */}
      {/* <div>
        {games.map((game, index) => (
          <span key={game.id} style={{ margin: '0 5px', cursor: 'pointer', fontWeight: index === currentGameIndex ? 'bold' : 'normal' }} onClick={() => setCurrentGameIndex(index)}>
            {index + 1}
          </span>
        ))}
      </div> */}
    </div>
  );
}

export default GameDiscovery;