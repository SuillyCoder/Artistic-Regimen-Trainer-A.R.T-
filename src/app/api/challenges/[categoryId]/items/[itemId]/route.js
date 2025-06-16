// src/app/api/challenges/[categoryId]/items/[itemId]/route.js
import { NextResponse } from 'next/server';
import { firestore } from '../../../../../../../lib/firebaseAdmin'; // Assuming this path to your Admin SDK setup
/**
 * GET /api/challenges/[categoryId]/items/[itemId]
 * Fetches details for a specific challenge item.
 */
export async function GET(request, { params }) {
  const { categoryId, itemId } = params;

  try {
    const itemRef = firestore.collection('challenges').doc(categoryId).collection('challengeItems').doc(itemId);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'Challenge item not found.' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching challenge item ${itemId} for category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/challenges/[categoryId]/items/[itemId]
 * Updates details for a specific challenge item.
 * Body should contain fields to update (e.g., { title: "new title" }).
 */
export async function PUT(request, { params }) {
  const { categoryId, itemId } = params;

  try {
    const updates = await request.json();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update.' }, { status: 400 });
    }

    const itemRef = firestore.collection('challenges').doc(categoryId).collection('challengeItems').doc(itemId);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'Challenge item not found.' }, { status: 404 });
    }

    await itemRef.update(updates);

    return NextResponse.json({ message: `Challenge item '${itemId}' updated successfully!` }, { status: 200 });
  } catch (error) {
    console.error(`Error updating challenge item ${itemId} for category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/challenges/[categoryId]/items/[itemId]
 * Deletes a specific challenge item and its 'difficulty' sub-collection.
 * NOTE: Similar to category deletion, for large subcollections, consider recursive delete.
 */
export async function DELETE(request, { params }) {
  const { categoryId, itemId } = params;

  try {
    const itemRef = firestore.collection('challenges').doc(categoryId).collection('challengeItems').doc(itemId);
    const itemDoc = await itemRef.get();

    if (!itemDoc.exists) {
      return NextResponse.json({ message: 'Challenge item not found.' }, { status: 404 });
    }

    // This deletes the item document. For recursive deletion of its subcollections,
    // you would need more advanced logic (e.g., Firebase Admin SDK's `deleteCollection` or Cloud Functions).
    await itemRef.delete();

    return NextResponse.json({ message: `Challenge item '${itemId}' deleted successfully!` }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting challenge item ${itemId} for category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}