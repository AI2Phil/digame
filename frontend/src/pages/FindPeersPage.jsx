import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Example: Card component (if you have one, otherwise simple divs will be used)
// import Card from '../components/ui/Card';

const FindPeersPage = () => {
  const [matches, setMatches] = useState([]);
  const [matchType, setMatchType] = useState('skills'); // Default match type: 'skills' or 'learning_partner'
  const [skillFilter, setSkillFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Get navigate function

  // Assume a fixed user ID for now. In a real app, this would come from auth context or localStorage.
  const currentUserId = 1;

  const fetchPeerMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let apiUrl = `/api/social/users/${currentUserId}/peer-matches?limit=20`;

    if (matchType) {
      apiUrl += `&match_type=${encodeURIComponent(matchType)}`;
    }
    if (skillFilter) {
      apiUrl += `&skill_filter=${encodeURIComponent(skillFilter)}`;
    }

    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, { headers });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { detail: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (e) {
      console.error("Failed to fetch peer matches:", e);
      setError(e.message);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  }, [matchType, skillFilter, currentUserId]);

  useEffect(() => {
    fetchPeerMatches();
  }, [fetchPeerMatches]);

  const handlePeerClick = (match) => {
    console.log("Clicked Peer Details:", {
      id: match.id,
      name: match.name,
      skills: match.skills, // Or other relevant details
      title: match.title,
      company: match.company,
      compatibilityScore: match.compatibilityScore,
      matchData: match // Log the whole match object for full details
    });
    // Optional: Navigate to a placeholder profile page
    // navigate(`/users/${match.id}/profile_placeholder`); // Example, if a profile page exists
    alert(`You clicked on ${match.name || 'this peer'}. Check the console for more details.`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ fontSize: '2rem', color: '#333' }}>Find Peers</h1>
        <p style={{ fontSize: '1rem', color: '#666' }}>Discover and connect with peers based on skills and learning goals.</p>
      </header>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label htmlFor="matchType" style={{ marginRight: '5px', fontWeight: 'bold' }}>Match Type: </label>
          <select
            id="matchType"
            value={matchType}
            onChange={(e) => setMatchType(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="skills">Skills</option>
            <option value="learning_partner">Learning Partner</option>
          </select>
        </div>

        <div>
          <label htmlFor="skillFilter" style={{ marginRight: '5px', fontWeight: 'bold' }}>Filter by Skill: </label>
          <input
            type="text"
            id="skillFilter"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="e.g., Python, React"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
          />
        </div>
      </div>

      {isLoading && <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading matches...</p>}

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', border: '1px solid #ef9a9a', color: '#c62828', borderRadius: '4px', textAlign: 'center' }}>
          Error fetching matches: {error}
        </div>
      )}

      {!isLoading && !error && matches.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#777' }}>No peer matches found for your criteria.</p>
      )}

      {!isLoading && !error && matches.length > 0 && (
        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {matches.map(match => (
            <div
              key={match.id}
              className="match-card"
              style={{
                border: '1px solid #ddd',
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                cursor: 'pointer' // Added cursor pointer
              }}
              onClick={() => handlePeerClick(match)} // Added onClick handler
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333', fontSize: '1.25rem' }}>{match.name || 'N/A'}</h3>
              <p style={{ marginBottom: '5px', color: '#555' }}><strong>Title:</strong> {match.title || 'N/A'}</p>
              <p style={{ marginBottom: '5px', color: '#555' }}><strong>Company:</strong> {match.company || 'N/A'}</p>
              <p style={{ marginBottom: '10px', color: '#555' }}><strong>Compatibility:</strong> {match.compatibilityScore || 'N/A'}%</p>

              {matchType === 'skills' && match.skills && match.skills.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#333' }}>Skills:</strong>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                    {match.skills.map(skill => (
                      <li key={skill} style={{ backgroundColor: '#e0e0e0', color: '#333', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matchType === 'learning_partner' && match.learningGoals && match.learningGoals.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#333' }}>Learning Goals:</strong>
                   <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                    {match.learningGoals.map(goal => (
                      <li key={goal} style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {match.matchReason && (
                 <p style={{ fontStyle: 'italic', color: '#777', fontSize: '0.9rem', borderTop: '1px dashed #eee', paddingTop: '10px', marginTop: '10px' }}>
                    "{match.matchReason}"
                 </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindPeersPage;
