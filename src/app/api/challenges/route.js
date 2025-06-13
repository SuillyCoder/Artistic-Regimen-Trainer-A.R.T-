// src/app/api/challenges/route.js
import { firestore, FieldValue } from '../../../../lib/firebaseAdmin'; // Adjust path if needed

export async function GET(request) {
  try {
    const challengesRef = firestore.collection('challenges');
    const snapshot = await challengesRef.get();

    if (snapshot.empty) {
      return new Response(JSON.stringify({ message: 'No challenge categories found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching challenge categories:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const { title, category, description } = await request.json();

    if (!title || !category || !description) {
      return new Response(JSON.stringify({ message: 'Missing required fields: title, category, description.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ensure the 'category' field is treated as the document ID (slug)
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');

    const challengeDocRef = firestore.collection('challenges').doc(categorySlug);

    // Check if a document with this ID already exists
    const docSnapshot = await challengeDocRef.get();
    if (docSnapshot.exists) {
      // You might want to handle this differently:
      // 1. Return 409 Conflict if you don't allow overwriting.
      // 2. Update existing document with merge: true if you allow partial updates.
      // 3. Just continue and overwrite (default for .set() if no merge).

      // For creating new categories, a 409 Conflict is often appropriate
      return new Response(JSON.stringify({ message: `Category with ID '${categorySlug}' already exists.` }), {
        status: 409, // Conflict
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newCategoryData = {
      title,
      category: categorySlug, // Store the slug as the category field as well for consistency
      description,
      createdAt: FieldValue.serverTimestamp(), // Add a timestamp
    };

    await challengeDocRef.set(newCategoryData); // Use .set() to use the custom ID

    return new Response(JSON.stringify({
      message: 'Challenge category added successfully!',
      id: categorySlug,
      ...newCategoryData
    }), {
      status: 201, // Created
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error adding challenge category:', error);
    // Return a 500 Internal Server Error with more detail
    return new Response(JSON.stringify({
      message: 'Internal Server Error while adding challenge category',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined, // Include stack in dev
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Implement PUT and DELETE if needed for categories
// export async function PUT(request) { ... }
// export async function DELETE(request) { ... }