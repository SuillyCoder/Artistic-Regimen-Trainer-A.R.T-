// src/app/page.js
import TestUserGalleryApi from '../../../components/userData/authGalleryTest';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <TestUserGalleryApi />
      {/* Your other components */}
    </div>
  );
}