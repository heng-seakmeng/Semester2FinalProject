require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   MONGODB CONNECTION
========================================================= */

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("[DB] MongoDB connected"))
  .catch((err) => console.error("[DB] MongoDB connection error:", err));

/* =========================================================
   MONGODB SCHEMAS
========================================================= */

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "client" },
  createdAt: String,
});

const sessionSchema = new mongoose.Schema({
  token: { type: String, unique: true },
  userId: String,
});

const User = mongoose.model("User", userSchema);
const Session = mongoose.model("Session", sessionSchema);

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://heng-seakmeng.github.io",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:")
      ) {
        return callback(null, true);
      }
      console.log("Blocked CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

/* =========================================================
   FILE PATHS (for non-user data)
========================================================= */

const DATA_DIR = path.join(__dirname, "data");
const HOME_DATA_PATH = path.join(DATA_DIR, "home.json");
const CONTACT_DATA_PATH = path.join(DATA_DIR, "contact.json");
const INQUIRIES_PATH = path.join(DATA_DIR, "contact_inquiries.json");
const PURCHASE_REQUESTS_PATH = path.join(DATA_DIR, "purchase_requests.json");
const VEHICLES_DATA_PATH = path.join(DATA_DIR, "vehicles.json");
const ABOUT_DATA_PATH = path.join(DATA_DIR, "about.json");
const SERVICES_DATA_PATH = path.join(DATA_DIR, "services.json");
const FOOTER_DATA_PATH = path.join(DATA_DIR, "footer.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/* =========================================================
   HELPERS
========================================================= */

function readJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const data = fs.readFileSync(filePath, "utf-8");
    if (!data.trim()) return fallback;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file: ${filePath}`, error.message);
    return fallback;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing JSON file: ${filePath}`, error.message);
    return false;
  }
}

/* =========================================================
   BASIC & HEALTH CHECK ROUTES
========================================================= */

app.get("/", (req, res) => {
  res.json({ success: true, message: "McLaren Backend API is running!" });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated. No token." });
  }

  const session = await Session.findOne({ token });
  if (!session) {
    return res
      .status(401)
      .json({ error: "Not authenticated. Token invalid or expired." });
  }

  const user = await User.findOne({ id: session.userId });
  if (!user) {
    return res
      .status(401)
      .json({ error: "Not authenticated. User not found." });
  }

  req.user = user;
  req.token = token;
  next();
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    const email = req.user?.email?.toLowerCase();
    const isAdmin =
      req.user?.role === "admin" ||
      email === "admin@mclaren.com" ||
      email === "ronalheng832@gmail.com";

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }
    next();
  });
}

/* =========================================================
   AUTH ROUTES
========================================================= */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("[SIGNUP] Received:", { name, email });

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role:
        normalizedEmail === "admin@mclaren.com" ||
        normalizedEmail === "ronalheng832@gmail.com"
          ? "admin"
          : "client",
      createdAt: new Date().toISOString(),
    });

    await newUser.save();
    console.log("[SIGNUP] User saved to MongoDB:", normalizedEmail);

    const token = crypto.randomBytes(24).toString("hex");
    await Session.create({ token, userId: newUser.id });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("[SIGNUP] Fatal error:", error);
    res.status(500).json({ error: "Failed to create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[LOGIN] Attempt:", email);

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("[LOGIN] No user found for:", normalizedEmail);
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = crypto.randomBytes(24).toString("hex");
    await Session.create({ token, userId: user.id });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "client",
      },
    });
  } catch (error) {
    console.error("[LOGIN] Fatal error:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const { id, name, email, role } = req.user;
  res.json({ user: { id, name, email, role: role || "client" } });
});

app.post("/api/auth/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;
  if (token) await Session.deleteOne({ token });
  res.json({ success: true });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({
    email: (email || "").trim().toLowerCase(),
  });
  if (!user) {
    return res
      .status(404)
      .json({ error: "No account registered with this email." });
  }
  res.json({
    success: true,
    message: "If an account exists, a reset link has been sent.",
  });
});

/* =========================================================
   DATA ROUTES (unchanged — still use JSON files)
========================================================= */

app.get("/api/about", (req, res) => {
  const data = readJSON(ABOUT_DATA_PATH, null);
  if (!data)
    return res.status(500).json({ error: "Failed to read about data" });
  res.json(data);
});

app.get("/api/vehicles", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  res.json(data.vehicles || data);
});

app.get("/api/vehicles/:id", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  const vehicles = data.vehicles || data;
  const vehicle = vehicles.find((v) => String(v.id) === String(req.params.id));
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  res.json(vehicle);
});

app.get("/api/pillars", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { pillars: [] });
  res.json(data.pillars || []);
});

app.get("/api/home", (req, res) => {
  const data = readJSON(HOME_DATA_PATH, null);
  if (!data) return res.status(500).json({ error: "Failed to read home data" });
  res.json(data);
});

app.get("/api/home/:section", (req, res) => {
  const data = readJSON(HOME_DATA_PATH, null);
  if (!data) return res.status(500).json({ error: "Failed to read home data" });
  const section = data[req.params.section];
  if (!section) return res.status(404).json({ error: "Section not found" });
  res.json(section);
});

app.get("/api/contact", (req, res) => {
  const data = readJSON(CONTACT_DATA_PATH, null);
  if (!data)
    return res.status(500).json({ error: "Failed to read contact data" });
  res.json(data);
});

app.post("/api/contact/submit", (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;
  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newInquiry = {
    id: crypto.randomUUID(),
    fullName,
    email,
    phone: phone || "",
    subject,
    message,
    submittedAt: new Date().toISOString(),
  };
  const inquiries = readJSON(INQUIRIES_PATH, []);
  inquiries.push(newInquiry);
  writeJSON(INQUIRIES_PATH, inquiries);
  res.status(201).json({ success: true, inquiry: newInquiry });
});

app.get("/api/services", (req, res) => {
  res.json(readJSON(SERVICES_DATA_PATH, []));
});

app.post("/api/services", requireAdmin, (req, res) => {
  const services = readJSON(SERVICES_DATA_PATH, []);
  const newService = { id: crypto.randomUUID(), ...req.body };
  services.push(newService);
  writeJSON(SERVICES_DATA_PATH, services);
  res.status(201).json(newService);
});

app.put("/api/services/:id", requireAdmin, (req, res) => {
  const services = readJSON(SERVICES_DATA_PATH, []);
  const index = services.findIndex(
    (s) => String(s.id) === String(req.params.id),
  );
  if (index === -1) return res.status(404).json({ error: "Service not found" });
  services[index] = { ...services[index], ...req.body };
  writeJSON(SERVICES_DATA_PATH, services);
  res.json(services[index]);
});

app.delete("/api/services/:id", requireAdmin, (req, res) => {
  let services = readJSON(SERVICES_DATA_PATH, []);
  services = services.filter((s) => String(s.id) !== String(req.params.id));
  writeJSON(SERVICES_DATA_PATH, services);
  res.json({ success: true });
});

app.get("/api/products", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  res.json(data.vehicles || data);
});

app.post("/api/products", requireAdmin, (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  const vehicles = data.vehicles || data;
  const newVehicle = { id: crypto.randomUUID(), ...req.body };
  vehicles.push(newVehicle);
  data.vehicles = vehicles;
  writeJSON(VEHICLES_DATA_PATH, data);
  res.status(201).json(newVehicle);
});

app.put("/api/products/:id", requireAdmin, (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  const vehicles = data.vehicles || data;
  const index = vehicles.findIndex(
    (v) => String(v.id) === String(req.params.id),
  );
  if (index === -1) return res.status(404).json({ error: "Vehicle not found" });
  vehicles[index] = { ...vehicles[index], ...req.body };
  data.vehicles = vehicles;
  writeJSON(VEHICLES_DATA_PATH, data);
  res.json(vehicles[index]);
});

app.delete("/api/products/:id", requireAdmin, (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  data.vehicles = (data.vehicles || []).filter(
    (v) => String(v.id) !== String(req.params.id),
  );
  writeJSON(VEHICLES_DATA_PATH, data);
  res.json({ success: true });
});

app.get("/api/contact_inquiries", requireAdmin, (req, res) => {
  res.json(readJSON(INQUIRIES_PATH, []));
});

app.delete("/api/contact_inquiries/:id", requireAdmin, (req, res) => {
  let inquiries = readJSON(INQUIRIES_PATH, []);
  const targetId = req.params.id;
  inquiries = inquiries.filter(
    (i) =>
      i.id !== targetId &&
      i.submittedAt !== targetId &&
      i.fullName !== targetId,
  );
  writeJSON(INQUIRIES_PATH, inquiries);
  res.json({ success: true });
});

async function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;
  if (!token) return null;
  const session = await Session.findOne({ token });
  if (!session) return null;
  return await User.findOne({ id: session.userId });
}

const handleGetPurchaseRequests = async (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  const user = await getUserFromToken(req);
  let email = user ? user.email : req.query.email;

  if (email) {
    const mine = all
      .filter((r) => r.clientEmail?.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return res.json(mine);
  }
  res.json(all);
};

const handleDeletePurchaseRequest = (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  const filtered = all.filter((r) => String(r.id) !== String(req.params.id));
  writeJSON(PURCHASE_REQUESTS_PATH, filtered);
  res.json({ success: true });
};

app.get("/api/admin/purchase-requests", requireAdmin, (req, res) => {
  res.json(readJSON(PURCHASE_REQUESTS_PATH, []));
});

app.get("/api/purchase-requests/:id", (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  const found = all.find((r) => String(r.id) === String(req.params.id));
  if (!found)
    return res.status(404).json({ error: "Purchase request not found." });
  res.json(found);
});

app.put("/api/purchase-requests/:id", requireAdmin, (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  const index = all.findIndex((r) => String(r.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Request not found" });
  all[index] = { ...all[index], ...req.body };
  writeJSON(PURCHASE_REQUESTS_PATH, all);
  res.json(all[index]);
});

app.patch("/api/purchase-requests/:id/checkout", requireAuth, (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  const index = all.findIndex((r) => String(r.id) === String(req.params.id));
  if (index === -1)
    return res.status(404).json({ error: "Purchase request not found." });
  if (all[index].clientEmail?.toLowerCase() !== req.user.email.toLowerCase()) {
    return res
      .status(403)
      .json({ error: "You can only update your own purchase request." });
  }
  const { delivery } = req.body;
  all[index] = { ...all[index], hasCheckedOut: true, delivery };
  writeJSON(PURCHASE_REQUESTS_PATH, all);
  res.json(all[index]);
});

app.get("/api/purchase_requests", handleGetPurchaseRequests);
app.get("/api/purchase-requests", handleGetPurchaseRequests);

app.post("/api/purchase-requests", (req, res) => {
  const {
    clientName,
    clientEmail,
    vehicleName,
    carModel,
    deliveryRegion,
    exteriorColor,
    additionalNotes,
  } = req.body;
  if (!clientName || !clientEmail || !vehicleName) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  const newRequest = {
    id: crypto.randomUUID(),
    clientName,
    clientEmail,
    vehicleName,
    carModel,
    deliveryRegion,
    exteriorColor,
    additionalNotes: additionalNotes || "",
    status: "Pending Review",
    submittedAt: new Date().toISOString(),
  };
  all.push(newRequest);
  writeJSON(PURCHASE_REQUESTS_PATH, all);
  res.status(201).json(newRequest);
});

app.delete(
  "/api/purchase_requests/:id",
  requireAdmin,
  handleDeletePurchaseRequest,
);
app.delete(
  "/api/purchase-requests/:id",
  requireAdmin,
  handleDeletePurchaseRequest,
);

app.get("/api/footer", (req, res) => {
  res.json(readJSON(FOOTER_DATA_PATH, []));
});

app.put("/api/footer", requireAdmin, (req, res) => {
  const updatedData = req.body;
  if (!Array.isArray(updatedData)) {
    return res.status(400).json({ error: "Footer data must be an array" });
  }
  const success = writeJSON(FOOTER_DATA_PATH, updatedData);
  if (!success)
    return res.status(500).json({ error: "Failed to write footer data." });
  res.json({ success: true, footer: updatedData });
});

/* =========================================================
   ERROR HANDLERS
========================================================= */

app.use((req, res) => {
  res.status(404).json({ error: "API route not found", path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy blocked this request." });
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`McLaren Backend API running on port ${PORT}`);
});
