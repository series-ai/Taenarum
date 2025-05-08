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
  }
}

function GameDiscovery() {
  const [avatarId, setAvatarId] = useState(null);
  const [gameScore, setGameScore] = useState(null); // New state for the score

  useEffect(() => {
    const id = getAvatarIdFromLocalStorage();
    if (id) {
      setAvatarId(id);
    } else {
      console.log("No avatarId found in localStorage or error parsing.");
      // Optionally, set a default avatarId here, e.g., GameConfig.defaultPlayer.avatarId
      // setAvatarId(GameConfig.defaultPlayer.avatarId);
    }

    // --- Message event listener setup ---
    const handleMessage = (event) => {
      // IMPORTANT: Verify the origin of the message for security.
      // This is a placeholder check. You MUST adapt this to your specific environment.
      // If your iframe is served from 'http://localhost:xxxx' or your production domain,
      // use that exact origin: if (event.origin !== 'http://your-iframe-origin.com') return;
      // For 'file://' protocols, event.origin can be "null" or the full file path,
      // which makes universal checking tricky.
      // A common pattern for local development with file protocol might involve checking
      // if the source is the iframe itself, but this is less secure than explicit origin checks.
      // Example (use with caution, understand the implications):
      // if (event.source !== document.getElementById('gameIframe')?.contentWindow) {
      //   console.warn(`Message from unexpected source:`, event.source);
      //   return;
      // }
      // A more robust same-origin check for file protocol if you are certain the iframe
      // is also a local file from the same top-level directory structure (less common for production):
      // if (event.origin !== window.location.origin && event.origin !== 'null') {
      //   console.warn(`Received message from unexpected origin: ${event.origin}`);
      //  return;
      // }


      // Assuming the data is a string like "score=200"
      if (typeof event.data === 'object' && event.data.type === 'gameOver') {
        // Or if you send a structured object: { type: 'scoreUpdate', value: 200 }
        console.log("Received score object from iframe:", event.data);
        const score = event.data.fishScore;
        updateMoneyBalance(score);
      }
      // You can add more `else if` blocks here to handle other types of messages
    };

    window.addEventListener('message', handleMessage);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
    // --- End of message event listener setup ---

  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Construct the iframe src
  const avatarSuffix = avatarId ? `?avatarId=${avatarId}` : '';

  return (
    // Added className and an inline style for a specific background
    <div className="fullscreen-component game-discovery-screen" style={{ backgroundColor: '#e8f0fe' }}>
      <h2>Game Discovery</h2>
      {/* {gameScore !== null && (
        <h3>Game Score: {gameScore}</h3>
      )} */}
      <iframe src={`games/buckethat/index.html${avatarSuffix}`} width="400" height="640" title="Bucket Hat" id="gameIframe" />
      <iframe src={`games/blobderby/index.html${avatarSuffix}`} width="360" height="640" title="Blob Derby" id="gameIframe" />
      {/* game card 3 */}
    </div>
  );
}

export default GameDiscovery;