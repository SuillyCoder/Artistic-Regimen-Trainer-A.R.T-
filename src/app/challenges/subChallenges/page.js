// src/app/page.js
import TestChallengeItemsApi from '../../../components/challengeItemsTest';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <TestChallengeItemsApi />
      {/* Your other components */}
    </div>
  );
}