import React, { useState } from 'react';
import { Send, Image, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export function PostCreate({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user || !content.trim()) return;

  setIsLoading(true);

  try {
    const newPost = {
      content: content.trim(),
      image_url: image.trim() || undefined,  
    };

    const accessToken = localStorage.getItem('accessToken');

    const response = await axios.post(
      "http://localhost:5000/api/user/createPost", 
      newPost,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Send access token for verification
        }
      }
    );

    if (response.status === 201) {
      const createdPost = response.data.post;
      onPostCreated(createdPost); 
      setContent(''); 
      setImage('');
    } else {
      console.error("Failed to create post:", response.data.message);
    }

  } catch (error) {
    console.error("Error creating post:", error);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-start space-x-4">
        <img
          src={user?.profile_pic}
          alt={user?.name || 'User avatar'}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
        
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition duration-200"
              maxLength={500}
            />
            
            {image && (
              <div className="relative">
                <img
                  src={image}
                  alt="Post image preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  aria-label="Remove image"
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) setImage(url.trim());
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Image className="w-4 h-4" />
                  <span className="text-sm">Photo</span>
                </button>
                
                <span className="text-xs text-gray-400">
                  {content.length}/500
                </span>
              </div>
              
              <button
                type="submit"
                disabled={!content.trim() || isLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
