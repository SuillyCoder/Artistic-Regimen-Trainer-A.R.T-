// src/app/api/challenges/[challengeId]/items/route.js

// Import necessary Firestore functions and the 'db' instance
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase'; // Adjust path: 3 levels up to src, then into lib
import { NextResponse } from 'next/server';

/**
 * Handles GET requests to retrieve challenge items for a specific challenge.
 * URL: /api/challenges/[challengeId]/items
 * @param {Request} request The incoming request object.
 * @param {Object} params Dynamic route parameters, containing challengeId.
 * @returns {NextResponse} A JSON response containing the challenge items data or an error message.
 */
export async function GET(request, { params }) {
  try {
    const { challengeId } = params; // Get the challengeId from the dynamic route

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required.' }, { status: 400 });
    }

    // Reference the specific challengeItems subcollection
    const challengeItemsCollectionRef = collection(db, 'challenges', challengeId, 'challengeItems');

    // Fetch all documents from the challengeItems subcollection
    const querySnapshot = await getDocs(challengeItemsCollectionRef);
    const challengeItems = [];
    querySnapshot.forEach((doc) => {
      challengeItems.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(challengeItems, { status: 200 });
  } catch (error) {
    console.error(`Error getting challenge items for challenge ${params.challengeId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve challenge items.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to add a new challenge item to a specific challenge.
 * URL: /api/challenges/[challengeId]/items
 * Request Body: { challengeGallery: string[], instructions: string, order: number, setTimeLimit: number, timeLimits: number[] }
 * @param {Request} request The incoming request object.
 * @param {Object} params Dynamic route parameters, containing challengeId.
 * @returns {NextResponse} A JSON response with the ID of the newly added challenge item or an error message.
 */
export async function POST(request, { params }) {
  try {
    const { challengeId } = params; // Get the challengeId from the dynamic route

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required for adding item.' }, { status: 400 });
    }

    // Parse the request body to get the challenge item data
    const itemData = await request.json();

    // Basic validation (you might want more robust validation)
    if (!itemData.instructions || itemData.order === undefined) {
      return NextResponse.json({ error: 'Missing required fields: instructions or order.' }, { status: 400 });
    }

    // Add a new document to the specific challengeItems subcollection
    const docRef = await addDoc(collection(db, 'challenges', challengeId, 'challengeItems'), itemData);

    return NextResponse.json({ id: docRef.id, message: 'Challenge item added successfully.' }, { status: 201 });
  } catch (error) {
    console.error(`Error adding challenge item to challenge ${params.challengeId}:`, error);
    return NextResponse.json({ error: 'Failed to add challenge item.' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an existing challenge item.
 * URL: /api/challenges/[challengeId]/items?itemId=[itemId]
 * Request Body: { fieldToUpdate: newValue }
 * @param {Request} request The incoming request object.
 * @param {Object} params Dynamic route parameters, containing challengeId.
 * @returns {NextResponse} A JSON response confirming the update or an error message.
 */
export async function PUT(request, { params }) {
  try {
    const { challengeId } = params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId'); // Get the item ID from query parameters

    if (!challengeId || !itemId) {
      return NextResponse.json({ error: 'Challenge ID and Item ID are required for update.' }, { status: 400 });
    }

    // Parse the request body to get the updated item data
    const updatedData = await request.json();

    // Get a reference to the specific challenge item document
    const itemRef = doc(db, 'challenges', challengeId, 'challengeItems', itemId);

    // Update the document with the provided data
    await updateDoc(itemRef, updatedData);

    return NextResponse.json({ message: 'Challenge item updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating challenge item ${itemId} in challenge ${challengeId}:`, error);
    return NextResponse.json({ error: 'Failed to update challenge item.' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a challenge item.
 * URL: /api/challenges/[challengeId]/items?itemId=[itemId]
 * @param {Request} request The incoming request object.
 * @param {Object} params Dynamic route parameters, containing challengeId.
 * @returns {NextResponse} A JSON response confirming the deletion or an error message.
 */
export async function DELETE(request, { params }) {
  try {
    const { challengeId } = params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId'); // Get the item ID from query parameters

    if (!challengeId || !itemId) {
      return NextResponse.json({ error: 'Challenge ID and Item ID are required for deletion.' }, { status: 400 });
    }

    // Delete the specified challenge item document
    await deleteDoc(doc(db, 'challenges', challengeId, 'challengeItems', itemId));

    return NextResponse.json({ message: 'Challenge item deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting challenge item ${itemId} from challenge ${challengeId}:`, error);
    return NextResponse.json({ error: 'Failed to delete challenge item.' }, { status: 500 });
  }
}