require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Connect to MongoDB
connectDB();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const leadRoutes = require("./routes/leadsRoutes");
const saleRoutes = require("./routes/saleRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const roleRoutes = require("./routes/roleRoutes");
const dashboardRoutes1 = require("./routes/dashboardRoutes1");
const contactRoutes = require("./routes/contactRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: [
    "http://localhost:8080",        
    "http://localhost:5173",        
    "https://investor-frontend-taupe.vercel.app", 
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const io = new Server(server, { cors: corsOptions });
app.set("socketio", io);

io.on("connection", (socket) => {
  console.log(`User connected via WebSocket: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Architect Platform API is running..." });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/sales", saleRoutes);
app.use("/api/v1/commissions", commissionRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/dashboard1", dashboardRoutes1);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/blogs", blogRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
