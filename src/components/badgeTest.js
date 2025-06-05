// src/components/TestBadgesApi.js
'use client';
import { useState, useEffect } from 'react';

export default function TestBadgesApi() {
  const [badges, setBadges] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  // State for adding a new badge
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeDescription, setNewBadgeDescription] = useState('');
  const [newBadgeImage, setNewBadgeImage] = useState('');
  const [newBadgeCondition, setNewBadgeCondition] = useState('');

  useEffect(() => {
    fetchBadges();
  }, []);

  // Function to fetch all badges
  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/badges'); // API endpoint for badges
      if (res.ok) {
        const data = await res.json();
        setBadges(data);
        setStatusMessage('Badges fetched successfully.');
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch badges:', errorData.error || res.statusText);
        setStatusMessage(`Failed to fetch badges: ${errorData.error || res.statusText}`);
        setBadges([]);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      setStatusMessage(`Error fetching badges: ${error.message}`);
      setBadges([]);
    }
  };

  // Function to handle adding a new badge
  const handleAddBadge = async () => {
    const newBadgeData = {
      name: newBadgeName || `New Badge ${Date.now()}`,
      description: newBadgeDescription || 'A new badge description.',
      image: newBadgeImage || `https://placehold.co/80x80/FFD700/000000?text=Badge`, // Gold color
      condition: newBadgeCondition || 'Complete 1 challenge.',
    };

    try {
      const res = await fetch('/api/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBadgeData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Badge added with ID: ${data.id}`);
        // Clear form fields
        setNewBadgeName('');
        setNewBadgeDescription('');
        setNewBadgeImage('');
        setNewBadgeCondition('');
        fetchBadges(); // Refresh the list
      } else {
        setStatusMessage(`Failed to add badge: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatusMessage(`Error adding badge: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  // Function to handle updating an existing badge (simulating tampering)
  const handleUpdateBadge = async (id, currentName, currentCondition) => {
    // Simulate updating a field, e.g., changing the description or condition
    const updatedData = {
      description: `Updated description for "${currentName}" @ ${new Date().toLocaleTimeString()}`,
      condition: `Tampered Condition: ${currentCondition} (Changed!)`,
      image: `https://placehold.co/80x80/FF0000/FFFFFF?text=Tampered`, // Visual indication of tampering
    };
    try {
      const res = await fetch(`/api/badges?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Badge with ID ${id} updated (tampered).`);
        fetchBadges(); // Refresh the list
      } else {
        setStatusMessage(`Failed to update badge ${id}: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatusMessage(`Error updating badge ${id}: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  // Function to handle deleting a badge
  const handleDeleteBadge = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete badge "${name}" (ID: ${id})?`)) {
      return; // User cancelled
    }
    try {
      const res = await fetch(`/api/badges?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Badge with ID ${id} deleted.`);
        fetchBadges(); // Refresh the list
      } else {
        setStatusMessage(`Failed to delete badge ${id}: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatusMessage(`Error deleting badge ${id}: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2C3E50', textAlign: 'center', marginBottom: '25px' }}>Test Badges API</h2>

      <button onClick={fetchBadges} style={{
        padding: '12px 20px',
        backgroundColor: '#9B59B6', // Amethyst color
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        marginBottom: '20px',
        display: 'block',
        width: '100%'
      }}>
        Refresh All Badges
      </button>

      {statusMessage && (
        <p style={{
          backgroundColor: '#E6E6FA', // Light purple
          border: '1px solid #BB99DD',
          padding: '10px',
          borderRadius: '5px',
          color: '#5E3B8F',
          marginBottom: '15px'
        }}>
          {statusMessage}
        </p>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Add New Badge:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#FDFDFD' }}>
          <input
            type="text"
            placeholder="Badge Name"
            value={newBadgeName}
            onChange={(e) => setNewBadgeName(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <textarea
            placeholder="Description"
            value={newBadgeDescription}
            onChange={(e) => setNewBadgeDescription(e.target.value)}
            rows="2"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', resize: 'vertical' }}
          ></textarea>
          <input
            type="text"
            placeholder="Image URL (e.g., https://placehold.co/80x80?text=Badge)"
            value={newBadgeImage}
            onChange={(e) => setNewBadgeImage(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Condition (e.g., Complete 1 challenge)"
            value={newBadgeCondition}
            onChange={(e) => setNewBadgeCondition(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <button onClick={handleAddBadge} style={{
            padding: '10px 15px',
            backgroundColor: '#8E44AD', // Darker Amethyst
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 'bold'
          }}>
            Add Badge
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Existing Badges:</h3>
        {badges.length === 0 ? (
          <p>No badges found. Add some above!</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {badges.map((badge) => (
              <li key={badge.id} style={{
                border: '1px solid #CFCFCF',
                padding: '15px',
                margin: '10px 0',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                {badge.image && (
                  <img
                    src={badge.image}
                    alt={badge.name || 'Badge Image'}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #FFD700' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/80x80/FF5733/FFFFFF?text=Error`;
                      console.error('Image failed to load:', badge.image);
                    }}
                  />
                )}
                <div style={{ flexGrow: 1 }}>
                  <p><strong>Name:</strong> {badge.name || 'N/A'}</p>
                  <p><strong>Description:</strong> {badge.description || 'N/A'}</p>
                  <p><strong>Condition:</strong> {badge.condition || 'N/A'}</p>
                  <p style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>ID: {badge.id}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => handleUpdateBadge(badge.id, badge.name, badge.condition)}
                    style={{ padding: '8px 12px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Tamper Update
                  </button>
                  <button
                    onClick={() => handleDeleteBadge(badge.id, badge.name)}
                    style={{ padding: '8px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Delete Badge
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
