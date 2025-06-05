// src/app/page.js
import TestBadgesApi from '../../components/badgeTest';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <TestBadgesApi />
      {/* Your other components */}
    </div>
  );
}