import React, { useState } from 'react';
import './App.css';
import TitleScreen from './TitleScreen';
import GameDiscovery from './GameDiscovery';
import { useSwipeable } from 'react-swipeable';

function App() {
  const [screen, setScreen] = useState('title'); // 'title' or 'discovery'

  const handlers = useSwipeable({
    onSwipedUp: () => setScreen('discovery'),
    onSwipedDown: () => setScreen('title'), // Optional: swipe down to go back to title
    preventScrollOnSwipe: true,
    trackMouse: true, // Optional: for mouse interaction
  });

  return (
    <div className="App" {...handlers}>
      {screen === 'title' && <TitleScreen />}
      {screen === 'discovery' && <GameDiscovery />}
    </div>
  );
}

export default App;
