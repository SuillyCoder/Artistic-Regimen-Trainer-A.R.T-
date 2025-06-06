// src/app/page.js
import TestUserBadgesApi from '../../../components/userData/authBadgeTest';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <TestUserBadgesApi />
      {/* Your other components */}
    </div>
  );
}