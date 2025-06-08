// src/components/TestModuleItemsApi.js
'use client';
import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage functions
import { storage } from '../../../lib/firebase'; // Import the initialized storage instance

export default function AnatomyModulesApi() {
  const moduleIdToTest = 'anatomy'; // <<<<<<< IMPORTANT: Change this to the ID of the module you want to test!

  const [moduleItems, setModuleItems] = useState([]);
  const [addStatus, setAddStatus] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');

  // States for adding a new module item
  const [newItemFile, setNewItemFile] = useState(null); // For file upload
  const [newItemLink, setNewItemLink] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemOrder, setNewItemOrder] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false); // New loading state for upload
  const [uploadProgress, setUploadProgress] = useState(0); // New for upload progress

  useEffect(() => {
    fetchModuleItems();
  }, []);

  const fetchModuleItems = async () => {
    try {
      const res = await fetch(`/api/modules/${moduleIdToTest}/items`);
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setModuleItems(sortedData);
      } else {
        console.error('Failed to fetch module items:', res.status);
        setModuleItems([]);
      }
    } catch (error) {
      console.error('Error fetching module items:', error);
      setModuleItems([]);
    }
  };

  // Function to handle adding a new module item
  const handleAddModuleItem = async () => {
    setUploadingImage(true); // Start upload indicator
    let imageUrl = '';

    // If a file is selected, upload it to Firebase Storage
    if (newItemFile) {
      try {
        const storageRef = ref(storage, `module_items/${moduleIdToTest}/${newItemFile.name}_${Date.now()}`);
        const uploadTask = uploadBytes(storageRef, newItemFile);

        // Optional: Listen for state changes, errors, and completion of the upload.
        // For simplicity, we'll just await the promise.
        const snapshot = await uploadTask;
        imageUrl = await getDownloadURL(snapshot.ref);
        setUploadingImage(false);
        setUploadProgress(100);
        setStatusMessage('Image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadingImage(false);
        setUploadProgress(0);
        setAddStatus(`Failed to upload image: ${error.message}`);
        return; // Stop if image upload fails
      }
    } else {
      // If no file, use placeholder image for custom entry, or default for dummy
      imageUrl = `https://placehold.co/100x100/ADD8E6/000000?text=Item_Img_${Date.now()}`;
      setUploadingImage(false);
      setUploadProgress(100);
    }

    const newItem = {
      image: imageUrl, // Use the uploaded URL or placeholder
      link: newItemLink || `https://example.com/test_link_${Date.now()}`,
      title: newItemTitle || `Test Item ${Date.now()}`,
      order: parseInt(newItemOrder) || (moduleItems.length > 0 ? Math.max(...moduleItems.map(item => item.order || 0)) + 1 : 1),
    };

    try {
      const res = await fetch(`/api/modules/${moduleIdToTest}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (res.ok) {
        setAddStatus(`Module item added with ID: ${data.id}`);
        // Clear form fields
        setNewItemFile(null); // Clear file input
        setNewItemLink('');
        setNewItemTitle('');
        setNewItemOrder('');
        fetchModuleItems(); // Refresh the list
      } else {
        setAddStatus(`Failed to add module item: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setAddStatus(`Error adding module item: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  const handleUpdateModuleItem = async (itemId, currentTitle, currentLink, currentImage) => {
    const tamperedData = {
      title: `${currentTitle} - TAMPERED!`,
      link: `https://tampered.example.com/${itemId}`,
      image: `https://placehold.co/100x100/FF0000/FFFFFF?text=Tampered`, // Visual indication of tampering
      order: (Math.random() > 0.5 ? 999 : 1),
    };

    try {
      const res = await fetch(`/api/modules/${moduleIdToTest}/items?itemId=${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tamperedData),
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateStatus(`Module item with ID ${itemId} updated (tampered).`);
        fetchModuleItems();
      } else {
        setUpdateStatus(`Failed to update module item ${itemId}: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setUpdateStatus(`Error updating module item ${itemId}: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  const handleDeleteModuleItem = async (itemId) => {
    try {
      const res = await fetch(`/api/modules/${moduleIdToTest}/items?itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteStatus(`Module item with ID ${itemId} deleted.`);
        fetchModuleItems();
      } else {
        setDeleteStatus(`Failed to delete module item ${itemId}: ${data.error}`);
      }
    } catch (error) {
      setDeleteStatus(`Error deleting module item ${itemId}: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333' }}>Test Module Items API for "{moduleIdToTest}"</h2>

      <button onClick={fetchModuleItems} style={{ padding: '10px 15px', margin: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Refresh Module Items
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#555' }}>Current Module Items:</h3>
        {moduleItems.length === 0 ? (
          <p>No module items found for "{moduleIdToTest}". Add some below!</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {moduleItems.map((item) => (
              <li key={item.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '8px 0', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9' }}>
                <div style={{ flexGrow: 1 }}>
                  <p><strong>Title:</strong> {item.title || 'N/A'}</p>
                  <p><strong>Link:</strong> <a href={item.link} target="_blank" rel="noopener noreferrer">{item.link || 'N/A'}</a></p>
                  <p>
                    <strong>Image:</strong>{' '}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || 'Module Item Image'}
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', marginTop: '5px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/100x100/FF5733/FFFFFF?text=Error`;
                          console.error('Image failed to load:', item.image);
                        }}
                      />
                    ) : (
                      'N/A'
                    )}
                  </p>
                  <p><strong>Order:</strong> {item.order !== undefined ? item.order : 'N/A'}</p>
                  <p style={{ fontSize: '0.8em', color: '#888' }}>ID: {item.id}</p>
                </div>
                <div style={{ marginLeft: '15px' }}>
                  <button
                    onClick={() => handleUpdateModuleItem(item.id, item.title, item.link, item.image)}
                    style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Tamper Update
                  </button>
                  <button
                    onClick={() => handleDeleteModuleItem(item.id)}
                    style={{ padding: '8px 12px', margin: '5px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ color: '#555' }}>Add New Module Item (for "{moduleIdToTest}")</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          {/* File Input for Image */}
          <label className="block text-sm font-medium text-gray-700">Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewItemFile(e.target.files[0])}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          {uploadingImage && <p style={{ color: '#007bff' }}>Uploading image... {uploadProgress}%</p>}
          <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
            (Leave blank to use a default placeholder image)
          </p>

          <input
            type="text"
            placeholder="Link URL"
            value={newItemLink}
            onChange={(e) => setNewItemLink(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input
            type="text"
            placeholder="Title"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input
            type="number"
            placeholder="Order (e.g., 1, 2)"
            value={newItemOrder}
            onChange={(e) => setNewItemOrder(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button onClick={handleAddModuleItem} disabled={uploadingImage} style={{
            padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', opacity: uploadingImage ? 0.7 : 1
          }}>
            {uploadingImage ? 'Adding (Uploading Image)...' : 'Add Module Item'}
          </button>
        </div>
        {addStatus && <p style={{ marginTop: '10px', color: '#333' }}>{addStatus}</p>}
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ color: '#555' }}>Operation Statuses:</h3>
        {updateStatus && <p style={{ color: '#008CBA' }}>{updateStatus}</p>}
        {deleteStatus && <p style={{ color: '#f44336' }}>{deleteStatus}</p>}
      </div>
    </div>
  );
}