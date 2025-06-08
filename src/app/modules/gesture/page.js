// src/app/page.js
import GestureModulesApi from '../../../components/moduleData/gestureModules';

export default function Home() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <GestureModulesApi />
      {/* Your other components */}
    </div>
  );
}