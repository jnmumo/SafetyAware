import React from 'react';
import { useLingo } from '@lingo.dev/react';

const LingoExample: React.FC = () => {
  const lingo = useLingo();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Lingo Integration Example</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Current Language</h3>
          <p className="text-blue-700">
            {lingo.locale}
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Translated Text Example</h3>
          <p className="text-green-700">
            {lingo.t('welcome_message', 'Welcome to Safety Aware Circle!')}
          </p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-800 mb-2">Language Selector</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => lingo.setLocale('en')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                lingo.locale === 'en' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              English
            </button>
            <button 
              onClick={() => lingo.setLocale('es')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                lingo.locale === 'es' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              Español
            </button>
            <button 
              onClick={() => lingo.setLocale('fr')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                lingo.locale === 'fr' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-800'
              }`}
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