import React from 'react';

const LingoExample: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Safety Tips</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Online Safety</h3>
          <p className="text-blue-700">
            Always be careful about what personal information you share online. Never give out your address, phone number, or school name to people you don't know.
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Physical Safety</h3>
          <p className="text-green-700">
            Trust your instincts! If something doesn't feel right, it probably isn't. It's always okay to say no and find a trusted adult.
          </p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-800 mb-2">Emergency Contacts</h3>
          <p className="text-purple-700">
            Make sure you know important phone numbers like your parents' numbers and emergency services (911 in the US, 999 or 112 in many other countries).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LingoExample;