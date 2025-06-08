// navigation/prompts/page.js
export default function PromptsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-5xl font-extrabold text-fuchsia-400 mb-4">
          Prompts
        </h1>
        <p className="text-lg text-gray-300">
          Generate new drawing prompts or browse existing ones.
        </p>
      </div>
    </div>
  );
}
