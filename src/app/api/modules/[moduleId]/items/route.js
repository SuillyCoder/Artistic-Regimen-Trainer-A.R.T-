// src/app/api/modules/[moduleId]/items/route.js

// Import necessary Firestore functions and the 'db' instance
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../../../lib/firebase'; // Adjust path: 3 levels up to src, then into lib
import { NextResponse } from 'next/server';

/**
 * Handles GET requests to retrieve module items for a specific module.
 * URL: /api/modules/[moduleId]/items
 * @param {Request} request The incoming request object.
 * @param {Object} params Dynamic route parameters, containing moduleId.
 * @returns {NextResponse} A JSON response containing the module items data or an error message.
 */
export async function GET(request, { params }) {
  try {
    const { moduleId } = params; // Get the moduleId from the dynamic route

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required.' }, { status: 400 });
    }

    // Reference the specific moduleItems subcollection
    const moduleItemsCollectionRef = collection(db, 'modules', moduleId, 'moduleItems');

    // Fetch all documents from the moduleItems subcollection
    const querySnapshot = await getDocs(moduleItemsCollectionRef);
    const moduleItems = [];
    querySnapshot.forEach((doc) => {
      moduleItems.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(moduleItems, { status: 200 });
  } catch (error) {
    console.error(`Error getting module items for module ${params.moduleId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve module items.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to add a new module item to a specific module.
 * URL: /api/modules/[moduleId]/items
 * Request Body: { image: string, link: string, title: string }
 * @param {Request} request The incoming request object.
 * @param {Object} params Dynamic route parameters, containing moduleId.
 * @returns {NextResponse} A JSON response with the ID of the newly added module item or an error message.
 */
export async function POST(request, { params }) {
  try {
    const { moduleId } = params; // Get the moduleId from the dynamic route

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required for adding item.' }, { status: 400 });
    }

    // Parse the request body to get the module item data
    const itemData = await request.json();

    // Validate incoming data (optional but recommended)
    if (!itemData.image || !itemData.link || !itemData.title) {
      return NextResponse.json({ error: 'Missing required fields: image, link, or title.' }, { status: 400 });
    }

    // Add a new document to the specific moduleItems subcollection
    const docRef = await addDoc(collection(db, 'modules', moduleId, 'moduleItems'), itemData);

    return NextResponse.json({ id: docRef.id, message: 'Module item added successfully.' }, { status: 201 });
  } catch (error) {
    console.error(`Error adding module item to module ${params.moduleId}:`, error);
    return NextResponse.json({ error: 'Failed to add module item.' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an existing module item.
 * URL: /api/modules/[moduleId]/items?itemId=[itemId]
 * Request Body: { fieldToUpdate: newValue }
 * @param {Request} request The incoming request object.
 * @param {Object} params Dynamic route parameters, containing moduleId.
 * @returns {NextResponse} A JSON response confirming the update or an error message.
 */
export async function PUT(request, { params }) {
  try {
    const { moduleId } = params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId'); // Get the item ID from query parameters

    if (!moduleId || !itemId) {
      return NextResponse.json({ error: 'Module ID and Item ID are required for update.' }, { status: 400 });
    }

    // Parse the request body to get the updated item data
    const updatedData = await request.json();

    // Get a reference to the specific module item document
    const itemRef = doc(db, 'modules', moduleId, 'moduleItems', itemId);

    // Update the document with the provided data
    await updateDoc(itemRef, updatedData);

    return NextResponse.json({ message: 'Module item updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating module item ${itemId} in module ${moduleId}:`, error);
    return NextResponse.json({ error: 'Failed to update module item.' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a module item.
 * URL: /api/modules/[moduleId]/items?itemId=[itemId]
 * @param {Request} request The incoming request object.
 * @param {Object} params Dynamic route parameters, containing moduleId.
 * @returns {NextResponse} A JSON response confirming the deletion or an error message.
 */
export async function DELETE(request, { params }) {
  try {
    const { moduleId } = params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId'); // Get the item ID from query parameters

    if (!moduleId || !itemId) {
      return NextResponse.json({ error: 'Module ID and Item ID are required for deletion.' }, { status: 400 });
    }

    // Delete the specified module item document
    await deleteDoc(doc(db, 'modules', moduleId, 'moduleItems', itemId));

    return NextResponse.json({ message: 'Module item deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting module item ${itemId} from module ${moduleId}:`, error);
    return NextResponse.json({ error: 'Failed to delete module item.' }, { status: 500 });
  }
}