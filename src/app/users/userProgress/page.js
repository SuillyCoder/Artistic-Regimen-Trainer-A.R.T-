// src/app/page.js
import TestUserProgressApi from '../../../components/userData/authProgressTest';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <TestUserProgressApi />
      {/* Your other components */}
    </div>
  );
}