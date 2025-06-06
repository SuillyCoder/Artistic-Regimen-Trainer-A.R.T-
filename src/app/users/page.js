// src/app/page.js
import AuthTest from '../../components/userData/authTest';
import TestUserBadgesApi from '../../components/userData/authBadgeTest';
import TestUserGalleryApi from '../../components/userData/authGalleryTest';
import TestUserProgressApi from '../../components/userData/authProgressTest';
import TestUserPromptsApi from '../../components/userData/authPromptTest';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px' }}>
      <h1>A.R.T. Trainer App - Development Test Page</h1>
      <AuthTest />
      <hr style={{ margin: '40px 0', borderTop: '2px dashed #ccc' }} />
      <h2>User-Specific Subcollection Tests (requires User ID from AuthTest)</h2>
      <TestUserBadgesApi />
      <hr style={{ margin: '40px 0', borderTop: '2px dashed #ccc' }} />
      <TestUserGalleryApi />
      <hr style={{ margin: '40px 0', borderTop: '2px dashed #ccc' }} />
      <TestUserProgressApi />
      <hr style={{ margin: '40px 0', borderTop: '2px dashed #ccc' }} />
      <TestUserPromptsApi />
    </div>
  );
}