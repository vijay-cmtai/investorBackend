require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

connectDB();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const leadRoutes = require("./routes/leadsRoutes");
const saleRoutes = require("./routes/saleRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
// --- YEH LINE ADD KAREIN ---
const inquiryRoutes = require("./routes/inquiryRoutes"); // Inquiry routes ko import karein

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "http://localhost:8080",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const io = new Server(server, { cors: corsOptions });
app.set("socketio", io);

app.get("/", (req, res) => {
  res.json({ message: "Photon Platform API is running..." });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/leads", leadRoutes);
// --- YEH LINE ADD KAREIN ---
app.use("/api/v1/inquiries", inquiryRoutes); // Sahi endpoint par inquiry routes ko use karein
app.use("/api/v1/sales", saleRoutes);
app.use("/api/v1/commissions", commissionRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);

io.on("connection", (socket) => {
  console.log(`✅ User connected via WebSocket: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
