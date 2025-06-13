// src/components/TestChallengeItemsApi.js
'use client';
import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage functions
import { storage } from '../../../lib/firebase'; // Import the initialized storage instance

export default function TestChallengeItemsApi() {
  const challengeIdToTest = '6tXib22LliAQVy5Xphee'; // <<<<<<< IMPORTANT: Change this to the ID of the challenge you want to test!

  const [challengeItems, setChallengeItems] = useState([]);
  const [addStatus, setAddStatus] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // States for adding a new challenge item
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // For MULTIPLE file uploads
  const [newChallengeGalleryText, setNewChallengeGalleryText] = useState(''); // Keep for comma-separated URLs fallback
  const [newInstructions, setNewInstructions] = useState('');
  const [newOrder, setNewOrder] = useState('');
  const [newSetTimeLimit, setNewSetTimeLimit] = useState('');
  const [newTimeLimits, setNewTimeLimits] = useState(''); // Comma-separated numbers

  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false); // New loading state for gallery uploads
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0); // New for total upload progress

  useEffect(() => {
    fetchChallengeItems();
  }, []);

  const fetchChallengeItems = async () => {
    try {
      const res = await fetch(`/api/challenges/${challengeIdToTest}/items`);
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setChallengeItems(sortedData);
      } else {
        console.error('Failed to fetch challenge items:', res.status);
        setChallengeItems([]);
      }
    } catch (error) {
      console.error('Error fetching challenge items:', error);
      setChallengeItems([]);
    }
  };

  // Function to handle adding a new module item
  const handleAddChallengeItem = async () => {
    setUploadingGalleryImages(true); // Start upload indicator
    let galleryUrls = [];

    // If files are selected, upload them to Firebase Storage
    if (newGalleryFiles.length > 0) {
      try {
        const uploadPromises = newGalleryFiles.map(async (file, index) => {
          const storageRef = ref(storage, `challenge_items/${challengeIdToTest}/${file.name}_${Date.now()}_${index}`);
          const snapshot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapshot.ref);
        });

        // Wait for all uploads to complete
        galleryUrls = await Promise.all(uploadPromises);

        setUploadingGalleryImages(false);
        setGalleryUploadProgress(100);
        setStatusMessage(`${newGalleryFiles.length} images uploaded successfully!`);
      } catch (error) {
        console.error('Error uploading gallery images:', error);
        setUploadingGalleryImages(false);
        setGalleryUploadProgress(0);
        setAddStatus(`Failed to upload gallery images: ${error.message}`);
        return; // Stop if image upload fails
      }
    } else {
      // If no files, use existing input for comma-separated URLs or a default placeholder
      if (newChallengeGalleryText) {
          galleryUrls = newChallengeGalleryText.split(',').map(s => s.trim()).filter(s => s !== '');
      } else {
          // Provide a default placeholder if no files and no text URLs
          galleryUrls = [`https://placehold.co/100x100/A0A0A0/FFFFFF?text=Gallery_Item_${Date.now()}`];
      }
      setUploadingGalleryImages(false);
      setGalleryUploadProgress(100);
    }

    const timeLimitsArray = newTimeLimits.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

    const newItem = {
      challengeGallery: galleryUrls, // Use uploaded URLs or parsed/default URLs
      instructions: newInstructions || `Default instructions for ${Date.now()}`,
      order: parseInt(newOrder) || (challengeItems.length > 0 ? Math.max(...challengeItems.map(item => item.order || 0)) + 1 : 1),
      setTimeLimit: parseInt(newSetTimeLimit) || 0,
      timeLimits: timeLimitsArray.length > 0 ? timeLimitsArray : [30, 60],
    };

    try {
      const res = await fetch(`/api/challenges/${challengeIdToTest}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (res.ok) {
        setAddStatus(`Challenge item added with ID: ${data.id}`);
        // Clear form fields
        setNewGalleryFiles([]); // Clear file input for multiple files
        setNewChallengeGalleryText(''); // Clear text input
        setNewInstructions('');
        setNewOrder('');
        setNewSetTimeLimit('');
        setNewTimeLimits('');
        fetchChallengeItems(); // Refresh the list
      } else {
        setAddStatus(`Failed to add challenge item: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setAddStatus(`Error adding challenge item: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  const handleUpdateChallengeItem = async (itemId, currentInstructions, currentOrder, currentSetTimeLimit) => {
    const tamperedData = {
      instructions: `${currentInstructions} - TAMPERED @ ${new Date().toLocaleTimeString()}!`,
      order: currentOrder === 1 ? 999 : 1,
      setTimeLimit: currentSetTimeLimit === 0 ? 60 : 0,
      // Provide multiple tampered images for the gallery
      challengeGallery: [
        `https://placehold.co/150x150/FF0000/FFFFFF?text=TAMPERED_IMG_1`,
        `https://placehold.co/150x150/FF0000/FFFFFF?text=TAMPERED_IMG_2`
      ],
      timeLimits: [10, 20, 30, 60],
    };

    try {
      const res = await fetch(`/api/challenges/${challengeIdToTest}/items?itemId=${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tamperedData),
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateStatus(`Challenge item with ID ${itemId} updated (tampered).`);
        fetchChallengeItems();
      } else {
        setUpdateStatus(`Failed to update challenge item ${itemId}: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setUpdateStatus(`Error updating challenge item ${itemId}: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  const handleDeleteChallengeItem = async (itemId) => {
    try {
      const res = await fetch(`/api/challenges/${challengeIdToTest}/items?itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteStatus(`Challenge item with ID ${itemId} deleted.`);
        fetchChallengeItems();
      } else {
        setDeleteStatus(`Failed to delete challenge item ${itemId}: ${data.error}`);
      }
    } catch (error) {
      setDeleteStatus(`Error deleting challenge item ${itemId}: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2C3E50', textAlign: 'center', marginBottom: '25px' }}>
        Test Challenge Items API for "{challengeIdToTest}"
      </h2>

      <button onClick={fetchChallengeItems} style={{
        padding: '12px 20px',
        backgroundColor: '#1ABC9C',
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
        Refresh Challenge Items
      </button>

      {addStatus && <p style={{ backgroundColor: '#D4EDDA', border: '1px solid #28A745', padding: '10px', borderRadius: '5px', color: '#155724', marginBottom: '15px' }}>{addStatus}</p>}
      {updateStatus && <p style={{ backgroundColor: '#FFF3CD', border: '1px solid #FFC107', padding: '10px', borderRadius: '5px', color: '#856404', marginBottom: '15px' }}>{updateStatus}</p>}
      {deleteStatus && <p style={{ backgroundColor: '#F8D7DA', border: '1px solid #DC3545', padding: '10px', borderRadius: '5px', color: '#721C24', marginBottom: '15px' }}>{deleteStatus}</p>}


      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Add New Challenge Item:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#FDFDFD' }}>
          {/* File Input for Challenge Gallery - NOW SUPPORTS MULTIPLE */}
          <label className="block text-sm font-medium text-gray-700">Upload Challenge Gallery Images:</label>
          <input
            type="file"
            accept="image/*"
            multiple // <--- Added 'multiple' attribute here
            onChange={(e) => setNewGalleryFiles(Array.from(e.target.files))} // Convert FileList to Array
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {newGalleryFiles.length > 0 && (
            <p className="text-sm text-gray-600">Selected: {newGalleryFiles.length} files</p>
          )}
          {uploadingGalleryImages && <p style={{ color: '#007bff' }}>Uploading images... {galleryUploadProgress}%</p>}
          <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
            (Select multiple images or use comma-separated URLs below)
          </p>
          {/* Keep the text input for comma-separated URLs as an alternative/fallback */}
          <input
            type="text"
            placeholder="Challenge Gallery URLs (comma-separated, alternative to upload)"
            value={newChallengeGalleryText}
            onChange={(e) => setNewChallengeGalleryText(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />

          <input
            type="text"
            placeholder="Instructions"
            value={newInstructions}
            onChange={(e) => setNewInstructions(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="number"
            placeholder="Order (e.g., 1, 2)"
            value={newOrder}
            onChange={(e) => setNewOrder(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="number"
            placeholder="Set Time Limit (e.g., 60 for 1 min)"
            value={newSetTimeLimit}
            onChange={(e) => setNewSetTimeLimit(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Time Limits (comma-separated numbers, e.g., 30,60,90)"
            value={newTimeLimits}
            onChange={(e) => setNewTimeLimits(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <button onClick={handleAddChallengeItem} disabled={uploadingGalleryImages} style={{
            padding: '10px 15px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', opacity: uploadingGalleryImages ? 0.7 : 1
          }}>
            {uploadingGalleryImages ? 'Adding (Uploading Images)...' : 'Add Challenge Item'}
          </button>
        </div>
        {addStatus && <p style={{ marginTop: '10px', color: '#333' }}>{addStatus}</p>}
      </div>

      <div>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Current Challenge Items:</h3>
        {challengeItems.length === 0 ? (
          <p>No challenge items found for "{challengeIdToTest}". Add some above!</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {challengeItems.map((item) => (
              <li key={item.id} style={{
                border: '1px solid #CFCFCF', padding: '15px', margin: '10px 0', borderRadius: '10px', backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <p><strong>Instructions:</strong> {item.instructions || 'N/A'}</p>
                <p><strong>Order:</strong> {item.order !== undefined ? item.order : 'N/A'}</p>
                <p><strong>Set Time Limit:</strong> {item.setTimeLimit !== undefined ? item.setTimeLimit : 'N/A'} seconds</p>
                <p><strong>Time Limits:</strong> {item.timeLimits ? item.timeLimits.join(', ') : 'N/A'}</p>
                <p><strong>Challenge Gallery:</strong></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                  {(item.challengeGallery && item.challengeGallery.length > 0) ? (
                    item.challengeGallery.map((url, index) => (
                      <img
                        key={`art-${item.id}-${index}`}
                        src={url}
                        alt={`Gallery Item ${index + 1}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/80x80/FF5733/FFFFFF?text=Art_Err`;
                          console.error('Image failed to load:', url);
                        }}
                      />
                    ))
                  ) : (
                    <span style={{ color: '#888' }}>No gallery images</span>
                  )}
                </div>
                <p style={{ fontSize: '0.8em', color: '#888', marginTop: '10px' }}>ID: {item.id}</p>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleUpdateChallengeItem(item.id, item.instructions, item.order, item.setTimeLimit)}
                    style={{ padding: '8px 12px', backgroundColor: '#F39C12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Tamper Update
                  </button>
                  <button
                    onClick={() => handleDeleteChallengeItem(item.id)}
                    style={{ padding: '8px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Delete
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