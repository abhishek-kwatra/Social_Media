import { supabase } from '../models/supabaseClient.js';

// POST /api/posts/:id/like
export const likePost = async (req, res) => {
  const postId = req.params.id;
  const { likes = 1 } = req.body;

  if (likes < 1 || likes > 50) {
    return res.status(400).json({ message: 'Likes must be between 1 and 50' });
  }

  try {
    // Check if like record exists
    const { data: existing, error: fetchError } = await supabase
      .from('likes')
      .select('count')
      .eq('post_id', postId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // Allow "no rows" error

    let totalLikes;
    if (existing) {
      // Update count
      const { data, error } = await supabase
        .from('likes')
        .update({ count: existing.count + likes })
        .eq('post_id', postId)
        .select('count')
        .single();

      if (error) throw error;
      totalLikes = data.count;
    } else {
      // Insert new like entry
      const { data, error } = await supabase
        .from('likes')
        .insert({ post_id: postId, count: likes })
        .select('count')
        .single();

      if (error) throw error;
      totalLikes = data.count;
    }

    res.status(200).json({ message: 'liked', totalLikes });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ message: 'Failed to like' });
  }
};

// GET /api/posts/:id/likes (Optional: if not embedding with post)
export const getLikes = async (req, res) => {
  const postId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('likes')
      .select('count')
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // allow "no rows"

    const count = data ? data.count : 0;
    res.status(200).json({ totalLikes: count });
  } catch (err) {
    console.error('Error fetching like count:', err);
    res.status(500).json({ message: 'Could not fetch like count' });
  }
};
