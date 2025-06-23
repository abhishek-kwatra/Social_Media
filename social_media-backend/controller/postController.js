import { supabase } from '../models/supabaseClient.js';

export const createPost = async (req, res) => {
  const { content, image_url } = req.body;
  const userId = req.user.id;

  if (!content && !image_url) {
    return res.status(400).json({ message: 'Post content or image required' });
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { user_id: userId, content, image_url },
      ])
      .select()
      .single(); // fetch inserted row

    if (error) throw error;

    res.status(201).json({ post: data });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

export const getFeed = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users ( name, profile_pic ),
        likes ( count )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Map likes count for clarity
    const formattedPosts = data.map(post => ({
      ...post,
      name: post.users?.name,
      profile_pic: post.users?.profile_pic,
      likes: post.likes?.count || 0,
    }));

    res.status(200).json({ posts: formattedPosts });
  } catch (err) {
    console.error('Error fetching feed:', err);
    res.status(500).json({ message: 'Failed to fetch feed' });
  }
};
