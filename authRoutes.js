const express = require("express");
const router = express.Router();  // <-- لازم تعرف الـ router ده

const users = require("./mockUsers");

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  // لا ترجع كلمة السر في الرد
  const { password: pw, ...userWithoutPassword } = user;

  res.json({ message: "Login successful", user: userWithoutPassword });
});

module.exports = router;
