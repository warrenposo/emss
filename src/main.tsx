
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize the app with strict error boundaries
const container = document.getElementById("root");

if (!container) {
  console.error("Failed to find the root element");
} else {
  const root = createRoot(container);
  
  // Render with error handling
  try {
    root.render(<App />);
  } catch (error) {
    console.error("Failed to render the application:", error);
    // Fallback render for critical errors
    root.render(
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">The application failed to load properly.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
