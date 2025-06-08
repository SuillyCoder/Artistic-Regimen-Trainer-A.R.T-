// src/app/page.js
import PerspectiveModulesApi from '../../../components/moduleData/perspectiveModules';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <PerspectiveModulesApi />
      {/* Your other components */}
    </div>
  );
}