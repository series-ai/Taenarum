import React, { useState, useEffect } from 'react';
// Ensure App.css is imported if GameDiscovery is meant to use .fullscreen-component from it.
// Typically, App.css is imported in App.js. If these styles are global, it's fine.
// import './App.css'; // Or a specific CSS file for GameDiscovery if preferred

// Function to retrieve avatarId from localStorage
function getAvatarIdFromLocalStorage() {
    const playerDataString = localStorage.getItem('playerData');
    if (playerDataString) {
        try {
            const playerData = JSON.parse(playerDataString);
            return playerData.avatarId;
        } catch (error) {
            console.error("Error parsing playerData from localStorage:", error);
            return null; // Or a default avatarId
        }
    }
    return null; // Or a default avatarId if no data is found
}

function GameDiscovery() {
  const [avatarId, setAvatarId] = useState(null);

  useEffect(() => {
    const id = getAvatarIdFromLocalStorage();
    if (id) {
      setAvatarId(id);
    } else {
      console.log("No avatarId found in localStorage or error parsing.");
      // Optionally, set a default avatarId here, e.g., GameConfig.defaultPlayer.avatarId
      // setAvatarId(GameConfig.defaultPlayer.avatarId); 
    }
  }, []);

  // Construct the iframe src
  const baseSrc = "games/blobderby/index.html";
  const iframeSrc = avatarId ? `${baseSrc}?avatarId=${avatarId}` : baseSrc;

  return (
    // Added className and an inline style for a specific background
    <div className="fullscreen-component game-discovery-screen" style={{ backgroundColor: '#e8f0fe' }}>
      <h2>Game Discovery</h2>
      <iframe src={iframeSrc} width="360" height="640" title="Blob Derby" />
      {/* game card 1 */}
      {/* game card 2 */}
      {/* game card 3 */}
    </div>
  );
}

export default GameDiscovery; 