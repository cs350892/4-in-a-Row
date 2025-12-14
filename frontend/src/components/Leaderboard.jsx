import React, { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Leaderboard - Top Players</h2>
      {loading ? (
        <div className="leaderboard-loading">Loading...</div>
      ) : data.length === 0 ? (
        <div className="leaderboard-empty">No games played yet</div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr className="leaderboard-header-row">
              <th className="leaderboard-header">Rank</th>
              <th className="leaderboard-header">Username</th>
              <th className="leaderboard-header">Wins</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.username} className={idx % 2 === 0 ? 'leaderboard-row-alt' : ''}>
                <td className="leaderboard-cell leaderboard-rank">{idx + 1}</td>
                <td className="leaderboard-cell">{row.username}</td>
                <td className="leaderboard-cell leaderboard-wins">{row.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}