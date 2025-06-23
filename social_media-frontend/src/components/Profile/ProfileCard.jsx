import { useState } from 'react';
import { Edit2,  Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileEdit } from './ProfileEdit';

export function ProfileCard() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  if (isEditing) {
    return <ProfileEdit onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
          <div className="relative -mt-16 mb-4 sm:mb-0">
            <img
              src={user.profile_pic}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 self-start sm:self-auto"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
            
            {user.bio && (
              <div className="mt-4">
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            )}
            
            {!user.bio && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-center">
                  Add a bio to tell others about yourself
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}