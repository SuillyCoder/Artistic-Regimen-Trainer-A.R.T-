// src/app/api/modules/route.js
// Import necessary Firestore functions and the 'db' instance
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase'; // Adjust the path based on your actual project structure
import { NextResponse } from 'next/server'; // Import NextResponse for API routes in Next.js App Router

/**
 * Handles GET requests to retrieve module data.
 * This function will fetch all documents from the 'modules' collection.
 * @returns {NextResponse} A JSON response containing the modules data or an error message.
 */
export async function GET(request) {
  try {
    // Fetch all documents from the 'modules' collection
    const querySnapshot = await getDocs(collection(db, 'modules'));
    const modules = [];
    querySnapshot.forEach((doc) => {
      // For each document, add its ID and data to the modules array
      modules.push({ id: doc.id, ...doc.data() });
    });

    // Return a successful response with the modules data
    return NextResponse.json(modules, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error getting modules:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to retrieve modules.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to add new module data.
 * The request body should contain the module data (e.g., category, description, title).
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response with the ID of the newly added module or an error message.
 */
export async function POST(request) {
  try {
    // Parse the request body to get the module data
    const moduleData = await request.json();

    // Add a new document to the 'modules' collection
    const docRef = await addDoc(collection(db, 'modules'), moduleData);

    // Return a successful response with the ID of the new module
    return NextResponse.json({ id: docRef.id, message: 'Module added successfully.' }, { status: 201 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error adding module:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to add module.' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update existing module data.
 * The request URL should include the 'id' query parameter for the module to update.
 * The request body should contain the fields to update.
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response confirming the update or an error message.
 */
export async function PUT(request) {
  try {
    // Get the 'id' query parameter from the request URL
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('id');

    // If no module ID is provided, return a bad request error
    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required for update.' }, { status: 400 });
    }

    // Parse the request body to get the updated module data
    const updatedData = await request.json();

    // Get a reference to the specific module document
    const moduleRef = doc(db, 'modules', moduleId);

    // Update the document with the provided data
    await updateDoc(moduleRef, updatedData);

    // Return a successful response
    return NextResponse.json({ message: 'Module updated successfully.' }, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error updating module:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to update module.' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete module data.
 * The request URL should include the 'id' query parameter for the module to delete.
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response confirming the deletion or an error message.
 */
export async function DELETE(request) {
  try {
    // Get the 'id' query parameter from the request URL
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('id');

    // If no module ID is provided, return a bad request error
    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required for deletion.' }, { status: 400 });
    }

    // Delete the specified module document
    await deleteDoc(doc(db, 'modules', moduleId));

    // Return a successful response
    return NextResponse.json({ message: 'Module deleted successfully.' }, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error deleting module:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to delete module.' }, { status: 500 });
  }
}