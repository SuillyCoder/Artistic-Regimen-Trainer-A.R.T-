// src/app/api/challenges/[categoryId]/items/route.js
import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '../../../../../../lib/firebaseAdmin'; // Assuming this path to your Admin SDK setup
import { FieldValue } from 'firebase-admin/firestore'; // For auto-incrementing 'order'

const adminDb = getFirebaseAdminApp();

/**
 * GET /api/challenges/[categoryId]/items
 * Fetches all challenge items for a specific category.
 */
export async function GET(request, { params }) {
  const { categoryId } = params;

  try {
    const itemsRef = adminDb.collection('challenges').doc(categoryId).collection('challengeItems');
    const snapshot = await itemsRef.orderBy('order').get(); // Order by 'order' field

    if (snapshot.empty) {
      return NextResponse.json({ message: `No challenge items found for category '${categoryId}'.` }, { status: 404 });
    }

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(`Error fetching challenge items for category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/challenges/[categoryId]/items
 * Adds a new challenge item to a specific category.
 * Body should contain { description: "string", title: "string", timeLimit: number (int) }
 * 'order' will be auto-generated.
 */
export async function POST(request, { params }) {
  const { categoryId } = params;

  try {
    const { description, title, timeLimit } = await request.json();

    if (!description || !title || timeLimit === undefined) {
      return NextResponse.json({ message: 'Missing required fields (description, title, timeLimit).' }, { status: 400 });
    }

    const itemsRef = adminDb.collection('challenges').doc(categoryId).collection('challengeItems');

    // To auto-increment 'order':
    // Find the current maximum order to set the new order
    const lastItemSnapshot = await itemsRef.orderBy('order', 'desc').limit(1).get();
    const newOrder = lastItemSnapshot.empty ? 1 : lastItemSnapshot.docs[0].data().order + 1;

    const newItem = {
      description,
      title,
      timeLimit,
      order: newOrder,
    };

    const docRef = await itemsRef.add(newItem); // Firestore generates a new DocumentID

    return NextResponse.json({ message: 'Challenge item added successfully!', id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error(`Error adding challenge item to category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}