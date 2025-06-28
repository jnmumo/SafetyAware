import React from 'react';

const LingoExample: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Language Selection</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Current Language</h3>
          <p className="text-blue-700">
            English
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Welcome Message</h3>
          <p className="text-green-700">
            Welcome to Safety Aware Circle!
          </p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-800 mb-2">Language Selector</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              className="px-3 py-1 rounded-full text-sm font-medium bg-purple-600 text-white"
            >
              English
            </button>
            <button 
              className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
            >
              Español
            </button>
            <button 
              className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
            >
              Français
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LingoExample;