import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from '../models/supabaseClient.js';


dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });
};



export const registerUser = async (req, res) => {
  const { name, email, password, profile_pic } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const { data: existingUser, error: existsError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword, profile_pic })
      .select('id, name, email, profile_pic')
      .single();

    if (insertError) throw insertError;

    const payload = { id: newUser.id, email: newUser.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token manually to a table if needed
    await supabase.from('refresh_tokens').insert({
      user_id: newUser.id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      accessToken,
      user: newUser,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profile_pic: user.profile_pic,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Token missing" });

  const { data: tokenData, error: tokenError } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token', refreshToken)
    .single();

  if (tokenError || !tokenData)
    return res.status(403).json({ message: "Invalid refresh token" });

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      // Delete old token
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('token', refreshToken);

      const userPayload = { id: decoded.id, email: decoded.email };
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
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ accessToken: newAccessToken });
    }
  );
};

export const logoutUser = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('token', token);
  }

  res.clearCookie('refreshToken');
  res.json({ message: "Logged out" });
};