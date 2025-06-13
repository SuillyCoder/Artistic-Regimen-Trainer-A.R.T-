// src/app/page.js
import TestChallengesApi from '../../components/challengeAssets/challengeTest';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <TestChallengesApi />
      {/* Your other components */}
    </div>
  );
}