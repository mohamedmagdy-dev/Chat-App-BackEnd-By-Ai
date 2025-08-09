const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// بيانات المستخدمين (وهمية)
const users = [
  {
    id: 1,
    username: "Mego ",
    email: "mohamedmagdyelsayed7@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    password: "mohamedmagdyelsayed7@gmail.com",
    address: "Scranton ,PA",
  },
  {
    id: 2,
    username: "Sara",
    email: "sara@example.com",
    avatar: "https://i.pravatar.cc/150?img=2",
    password: "password",
    address: "Scranton ,PA",
  },
  {
    id: 3,
    username: "Sohby",
    email: "Sohby@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    password: "Sohby@example.com",
    address: "Scranton ,PA",
  },
  {
    id: 4,
    username: "Nasser",
    email: "laila@example.com",
    avatar: "https://i.pravatar.cc/150?img=4",
    password: "laila@example.com",
    address: "Scranton ,PA",
  }
];

// ✅ تسجيل الدخول
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: "Login successful",
    user: userWithoutPassword,
  });
});

// ✅ الحصول على الأصدقاء
app.get("/api/friends", (req, res) => {
  const currentUserEmail = req.query.email;

  if (!currentUserEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const friends = users
    .filter((u) => u.email !== currentUserEmail)
    .map(({ password, ...rest }) => rest);

  res.json(friends);
});

// ✅ WebSocket Events
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // المستخدم ينضم لغرفة خاصة به
  socket.on("join", (user) => {
    socket.join(user.email);
    console.log(`✅ ${user.username} joined room: ${user.email}`);
  });

  // إرسال رسالة من sender إلى receiver
  socket.on("sendMessage", (data) => {
    const { sender, receiver, content, createdAt } = data;
    console.log(`📩 ${sender} => ${receiver}: ${content}`);

    // إرسال الرسالة فقط للمستلم
    io.to(receiver).emit("receiveMessage", {
      sender,
      receiver,
      content,
      createdAt,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ✅ تشغيل السيرفر
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
