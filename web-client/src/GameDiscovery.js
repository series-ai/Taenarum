import React from 'react';
// Ensure App.css is imported if GameDiscovery is meant to use .fullscreen-component from it.
// Typically, App.css is imported in App.js. If these styles are global, it's fine.
// import './App.css'; // Or a specific CSS file for GameDiscovery if preferred

function GameDiscovery() {
  return (
    // Added className and an inline style for a specific background
    <div className="fullscreen-component game-discovery-screen" style={{ backgroundColor: '#e8f0fe' }}>
      <h2>Game Discovery</h2>
      <iframe src="games/blobderby/index.html" width="360" height="640" title="Blob Derby" />
      {/* game card 1 */}
      {/* game card 2 */}
      {/* game card 3 */}
    </div>
  );
}

export default GameDiscovery; 