import { supabase } from '../models/supabaseClient.js';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, name } = req.body;

    // Input validation
    if (!bio || bio.length > 500) {
      return res.status(400).json({ message: 'Invalid bio. It must be under 500 characters.' });
    }

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Invalid name.' });
    }

    // Update user profile in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ name, bio })
      .eq('id', userId)
      .select('id, name, email, bio, profile_pic')
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    if (!data) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: data,
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};


