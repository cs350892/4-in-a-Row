import React from 'react';

export default function WaitingScreen() {
  return (
    <div className="waiting-container">
      <div className="waiting-content">
        <div className="waiting-spinner"></div>
        <h1 className="waiting-title">Waiting for opponent...</h1>
        <p className="waiting-desc">If no one joins in 10 seconds, you'll play against Bot</p>
      </div>
    </div>
  );
}
