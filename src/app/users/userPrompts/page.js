// src/app/page.js
import TestUserPromptsApi from '../../../components/userData/authPromptTest';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <TestUserPromptsApi />
      {/* Your other components */}
    </div>
  );
}