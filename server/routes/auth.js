// server/routes/auth.js
import express from "express";
import { supabase, supabaseAdmin } from "../utils/supabase.js";

const router = express.Router();

// Register - ONLY USE THIS IN DEVELOPMENT
router.post("/register", async (req, res) => {
  const { email, password, name, role = "USER" } = req.body;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: role.toUpperCase() },
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "User created successfully", user: data.user });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });

  const userWithRole = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name,
    role: data.user.user_metadata?.role || "USER",
  };

  res.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: userWithRole,
  });
});

// Get current logged-in user
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user)
    return res.status(401).json({ error: "Invalid or expired token" });

  res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || "User",
      role: data.user.user_metadata?.role || "USER",
    },
  });
});

export default router;
