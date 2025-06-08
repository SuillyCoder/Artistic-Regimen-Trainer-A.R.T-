// src/app/page.js
import AnatomyModulesApi from '../../../components/moduleData/anatomyModules';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <AnatomyModulesApi />
      {/* Your other components */}
    </div>
  );
}