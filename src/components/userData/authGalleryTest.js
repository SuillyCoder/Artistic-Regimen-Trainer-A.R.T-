// src/components/TestUserGalleryApi.js
'use client';
import { useState, useEffect } from 'react';

const DEFAULT_DOC_ID = 'default';

export default function TestUserGalleryApi() {
  const [userId, setUserId] = useState('');
  const [userGalleries, setUserGalleries] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const [newArtworkUrl, setNewArtworkUrl] = useState('');
  const [newReferenceUrl, setNewReferenceUrl] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserGalleries();
    } else {
      setUserGalleries([]);
      setStatusMessage('Enter a User ID to fetch galleries.');
    }
  }, [userId]);

  const fetchUserGalleries = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/gallery`);
      if (res.ok) {
        const data = await res.json();
        setUserGalleries(data);
        setStatusMessage(`Galleries fetched for user: ${userId}`);
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch user galleries:', errorData.error || res.statusText);
        setStatusMessage(`Failed to fetch user galleries: ${errorData.error || res.statusText}`);
        setUserGalleries([]);
      }
    } catch (error) {
      console.error('Error fetching user galleries:', error);
      setStatusMessage(`Error fetching user galleries: ${error.message}`);
      setUserGalleries([]);
    }
  };

  const handleAddArtwork = async () => {
    if (!newArtworkUrl) {
      setStatusMessage('Please enter an Artwork URL to add.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkToAdd: [newArtworkUrl],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Artwork URL added: ${newArtworkUrl}`);
        setNewArtworkUrl('');
        fetchUserGalleries();
      } else {
        setStatusMessage(`Failed to add artwork: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error adding artwork: ${error.message}`);
    }
  };

  const handleAddReference = async () => {
    if (!newReferenceUrl) {
      setStatusMessage('Please enter a Reference URL to add.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceToAdd: [newReferenceUrl],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Reference URL added: ${newReferenceUrl}`);
        setNewReferenceUrl('');
        fetchUserGalleries();
      } else {
        setStatusMessage(`Failed to add reference: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error adding reference: ${error.message}`);
    }
  };

  const handleTamperGallery = async () => {
    const defaultDoc = userGalleries[0];
    if (!defaultDoc) {
      setStatusMessage('No default gallery document to tamper.');
      return;
    }

    const tamperedArtwork = [
      `https://placehold.co/100x100/FF00FF/FFFFFF?text=Tampered_Art1`,
      `https://placehold.co/100x100/FF00FF/FFFFFF?text=Tampered_Art2`,
    ];
    const tamperedReference = [
      `https://placehold.co/100x100/00FFFF/000000?text=Tampered_Ref`,
    ];

    try {
      const res = await fetch(`/api/users/${userId}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkGallery: tamperedArtwork,
          referenceGallery: tamperedReference,
          tamperedAt: new Date(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Default gallery document updated (tampered).`);
        fetchUserGalleries();
      } else {
        setStatusMessage(`Failed to tamper gallery: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error tampering gallery: ${error.message}`);
    }
  };

  const handleClearGallery = async () => {
    if (!window.confirm(`Are you sure you want to clear ALL gallery data for this user (resets arrays to empty)?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/gallery`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`User gallery document cleared.`);
        fetchUserGalleries();
      } else {
        setStatusMessage(`Failed to clear gallery document: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error clearing gallery document: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2C3E50', textAlign: 'center', marginBottom: '25px' }}>Test User Gallery API</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Enter User ID (UID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button onClick={fetchUserGalleries} disabled={!userId} style={{
          padding: '10px 15px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}>
          Fetch User Galleries
        </button>
      </div>

      {statusMessage && (
        <p style={{ backgroundColor: '#E7F5FF', border: '1px solid #BEE3F8', padding: '10px', borderRadius: '5px', color: '#2B6CB0', marginBottom: '15px' }}>
          {statusMessage}
        </p>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Modify Default Gallery Document:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#FDFDFD' }}>
          <h4>Add Artwork URL:</h4>
          <input
            type="text"
            placeholder="New Artwork Image URL"
            value={newArtworkUrl}
            onChange={(e) => setNewArtworkUrl(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={handleAddArtwork} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Add Artwork
          </button>

          <h4 style={{ marginTop: '15px' }}>Add Reference URL:</h4>
          <input
            type="text"
            placeholder="New Reference Image URL"
            value={newReferenceUrl}
            onChange={(e) => setNewReferenceUrl(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={handleAddReference} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Add Reference
          </button>

          <h4 style={{ marginTop: '15px' }}>Tamper All Gallery Data:</h4>
          <button onClick={handleTamperGallery} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#F39C12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Tamper Gallery Data
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Current User Gallery Data (from 'default' document):</h3>
        {userGalleries.length === 0 ? (
          <p>No gallery data found for this user. Ensure 'default' document exists.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {userGalleries.map((galleryDoc) => (
              <li key={galleryDoc.id} style={{
                border: '1px solid #CFCFCF', padding: '15px', margin: '10px 0', borderRadius: '10px', backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <p><strong>Artwork Gallery:</strong></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                  {(galleryDoc.artworkGallery && galleryDoc.artworkGallery.length > 0) ? (
                    galleryDoc.artworkGallery.map((url, index) => (
                      <img
                        key={`art-${galleryDoc.id}-${index}`}
                        src={url}
                        alt={`Artwork ${index + 1}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/FF5733/FFFFFF?text=Art_Err`; }}
                      />
                    ))
                  ) : (
                    <span style={{ color: '#888' }}>No artwork images</span>
                  )}
                </div>
                <p style={{ marginTop: '15px' }}><strong>Reference Gallery:</strong></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                  {(galleryDoc.referenceGallery && galleryDoc.referenceGallery.length > 0) ? (
                    galleryDoc.referenceGallery.map((url, index) => (
                      <img
                        key={`ref-${galleryDoc.id}-${index}`}
                        src={url}
                        alt={`Reference ${index + 1}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/FF5733/FFFFFF?text=Ref_Err`; }}
                      />
                    ))
                  ) : (
                    <span style={{ color: '#888' }}>No reference images</span>
                  )}
                </div>
                <p style={{ fontSize: '0.8em', color: '#888', marginTop: '10px' }}>Document ID: {galleryDoc.id}</p>
                <div style={{ marginTop: '15px' }}>
                  <button
                    onClick={handleClearGallery}
                    style={{ padding: '8px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Clear All Gallery Data
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