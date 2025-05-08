import React, { useState, useEffect } from 'react';
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
    // Note: You might want to save the updated playerData back to localStorage here
    // localStorage.setItem('metagameGameState', JSON.stringify(playerData));
  }
}

const games = [
  {
    id: 'buckethat',
    title: 'Bucket Hat',
    srcPath: 'games/buckethat/index.html',
    width: '400',
    height: '640',
  },
  {
    id: 'blobderby',
    title: 'Blob Derby',
    srcPath: 'games/blobderby/index.html',
    width: '360',
    height: '640',
  },
  // Add more game objects here as needed
  // {
  //   id: 'newgame',
  //   title: 'New Game',
  //   srcPath: 'games/newgame/index.html',
  //   width: '400',
  //   height: '600',
  // },
];

function GameDiscovery() {
  const [avatarId, setAvatarId] = useState(null);
  // const [gameScore, setGameScore] = useState(null); // Kept for potential future use
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

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
        justifyContent: 'center',
        height: '100vh', // Ensure it takes full viewport height for swipe
        width: '100vw',  // Ensure it takes full viewport width for swipe
        overflow: 'hidden' // Prevents scrollbars if content is larger
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <h2>{currentGame.title}</h2>
      {/* Optional: Display current game score
      {gameScore !== null && (
        <h3>Game Score: {gameScore}</h3>
      )} */}

      <div style={{ margin: '20px 0' }}>
        <iframe
          src={`${currentGame.srcPath}${avatarSuffix}`}
          width={currentGame.width}
          height={currentGame.height}
          title={currentGame.title}
          id={`gameIframe-${currentGame.id}`} // Unique ID per iframe
          key={currentGame.id} // Important for React to re-render iframe on change
          style={{ pointerEvents: 'none' }} // Prevent iframe from capturing touch events needed for swipe
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={goToPreviousGame} style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}>
          Previous Game
        </button>
        {/* Next Game button removed, swipe up will trigger next game */}
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