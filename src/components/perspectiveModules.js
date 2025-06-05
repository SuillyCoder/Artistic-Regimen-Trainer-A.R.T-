'use client';
import { useState, useEffect } from 'react';

export default function PerspectiveModulesApi() {
  // Define the specific moduleId to test against based on your Firestore structure
  // For example, 'anatomy', 'gesture', or 'perspective' as per your top-level module documents
  const moduleIdToTest = 'perspective'; // You can change this to 'gesture' or 'perspective' as needed

  const [moduleItems, setModuleItems] = useState([]);
  const [addStatus, setAddStatus] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');

  // Fields for adding a new module item
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemLink, setNewItemLink] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemOrder, setNewItemOrder] = useState(''); // Added for potential order field

  useEffect(() => {
    fetchModuleItems();
  }, []);

  // Function to fetch all module items for the specified moduleId
  const fetchModuleItems = async () => {
    try {
      const res = await fetch(`/api/modules/${moduleIdToTest}/items`);
      if (res.ok) {
        const data = await res.json();
        // Sort items by 'order' if it exists, otherwise by ID
        const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setModuleItems(sortedData);
      } else {
        console.error('Failed to fetch module items:', res.status);
        setModuleItems([]); // Clear items on failure
      }
    } catch (error) {
      console.error('Error fetching module items:', error);
      setModuleItems([]); // Clear items on error
    }
  };

  // Function to add a new module item
  const handleAddModuleItem = async () => {
    const newItem = {
      image: newItemImage || `https://placehold.co/100x100/ADD8E6/000000?text=Item_Img_${Date.now()}`,
      link: newItemLink || `https://example.com/test_link_${Date.now()}`,
      title: newItemTitle || `Test Item ${Date.now()}`,
      order: parseInt(newItemOrder) || (moduleItems.length > 0 ? Math.max(...moduleItems.map(item => item.order || 0)) + 1 : 1), // Auto-increment order
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
        setNewItemImage(''); // Clear form fields
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

  // Function to update an existing module item (simulating tampering)
  const handleUpdateModuleItem = async (itemId, currentTitle, currentLink, currentImage) => {
    // Example of tampering: changing the link or title
    const tamperedData = {
      title: `${currentTitle} - TAMPERED!`, // Changing the title
      link: `https://tampered.example.com/${itemId}`, // Changing the link
      // image: 'https://placehold.co/100x100/FF0000/FFFFFF?text=Tampered', // Optionally change image
      order: (Math.random() > 0.5 ? 999 : 1), // Drastically change order
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
        fetchModuleItems(); // Refresh the list
      } else {
        setUpdateStatus(`Failed to update module item ${itemId}: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setUpdateStatus(`Error updating module item ${itemId}: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  // Function to delete a module item
  const handleDeleteModuleItem = async (itemId) => {
    try {
      const res = await fetch(`/api/modules/${moduleIdToTest}/items?itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteStatus(`Module item with ID ${itemId} deleted.`);
        fetchModuleItems(); // Refresh the list
      } else {
        setDeleteStatus(`Failed to delete module item ${itemId}: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setDeleteStatus(`Error deleting module item ${itemId}: ${error.message}`);
      console.error('Fetch Error:', error);
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
                  {/* Changed from text to an image tag */}
                  <p>
                    <strong>Image:</strong>{' '}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || 'Module Item Image'}
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', marginTop: '5px' }}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = `https://placehold.co/100x100/FF5733/FFFFFF?text=Error`; // Fallback image
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
          <input
            type="text"
            placeholder="Image URL"
            value={newItemImage}
            onChange={(e) => setNewItemImage(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
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
          <button onClick={handleAddModuleItem} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Add Module Item
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
