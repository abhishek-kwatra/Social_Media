import jwt from 'jsonwebtoken';
import { supabase } from '../models/supabaseClient.js';

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  });
};

export const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let accessToken;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.split(' ')[1];
  } else {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next(); // token valid, proceed
  } catch (err) {
    if (err.name !== 'TokenExpiredError') {
      return res.status(403).json({ message: 'Invalid access token' });
    }
  }

  // Refresh token flow
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: 'Refresh token required' });

  try {
    // Check if refresh token exists in Supabase
    const { data: tokenRecord, error: selectError } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .single();

    if (selectError || !tokenRecord)
      return res.status(403).json({ message: 'Invalid refresh token' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });

      const userPayload = { id: decoded.id, email: decoded.email };

      // Delete old refresh token
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('token', refreshToken);

      // Generate new tokens
      const newAccessToken = generateAccessToken(userPayload);
      const newRefreshToken = generateRefreshToken(userPayload);

      await supabase.from('refresh_tokens').insert({
        user_id: decoded.id,
        token: newRefreshToken,
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.setHeader('x-access-token', newAccessToken);

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};
