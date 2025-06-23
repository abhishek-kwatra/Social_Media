import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PostCreate } from './PostCreate';
import { PostCard } from './PostCard';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

export function PostFeed() {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await axios.get('https://social-media-backend-wlpj.onrender.com/api/user/getFeed');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handlePostCreated = (newPost) => {
    loadPosts();
  };

 const handleLike = async (postId) => {
  if (!user) return;

  try {
    const accessToken = localStorage.getItem('accessToken') || '';
    console.log(accessToken);

    if (!accessToken) {
      console.error('Access token is missing');
      return;
    }

    const response = await axios.post(
      `https://social-media-backend-wlpj.onrender.com/api/posts/${postId}/like`,
      {}, 
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Attach the access token in the Authorization header
        },
         withCredentials: true, 
      }
    );
    
    if (response.status === 200) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } else {
      console.error('Failed to like post. Response status:', response.status);
    }
  } catch (error) {
    console.error('Error liking post:', error);
  }
};


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PostCreate onPostCreated={handlePostCreated} />

      {Array.isArray(posts) && posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share something with the community!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(posts) &&
            posts.map(post => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
        </div>
      )}
    </div>
  );
}
