const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ---------------- File Paths ---------------- */
const HOME_DATA_PATH = path.join(__dirname, "data", "home.json");
const CONTACT_DATA_PATH = path.join(__dirname, "data", "contact.json");
const INQUIRIES_PATH = path.join(__dirname, "data", "contact_inquiries.json");
const USERS_PATH = path.join(__dirname, "data", "users.json");
const PURCHASE_REQUESTS_PATH = path.join(
  __dirname,
  "data",
  "purchase_requests.json",
);
const VEHICLES_DATA_PATH = path.join(__dirname, "data", "vehicles.json");
const ABOUT_DATA_PATH = path.join(__dirname, "data", "about.json");
const SERVICES_DATA_PATH = path.join(__dirname, "data", "services.json");

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

/* ---------------- Helpers ---------------- */

function readJSON(filePath, fallback) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// In-memory session store: token -> userId
const sessions = {};

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = sessions[token];
  if (!token || !userId) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const users = readJSON(USERS_PATH, []);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: "Not authenticated." });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (
      req.user?.role === "admin" ||
      req.user?.email?.toLowerCase() === "admin@mclaren.com" ||
      req.user?.email?.toLowerCase() === "ronalheng832@gmail.com"
    ) {
      next();
    } else {
      res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }
  });
}

/* ---------------- About Page Data ---------------- */

app.get("/api/about", (req, res) => {
  fs.readFile(ABOUT_DATA_PATH, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Failed to read about data" });
    res.json(JSON.parse(data));
  });
});

/* ---------------- Vehicles / Models Data ---------------- */

app.get("/api/vehicles", (req, res) => {
  fs.readFile(VEHICLES_DATA_PATH, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Failed to read vehicles data" });
    const json = JSON.parse(data);
    res.json(json.vehicles || json);
  });
});

app.get("/api/vehicles/:id", (req, res) => {
  fs.readFile(VEHICLES_DATA_PATH, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Failed to read vehicles data" });
    const json = JSON.parse(data);
    const list = json.vehicles || json;
    const vehicle = list.find((v) => v.id === req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json(vehicle);
  });
});

app.get("/api/pillars", (req, res) => {
  fs.readFile(VEHICLES_DATA_PATH, "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Failed to read pillars data" });
    const json = JSON.parse(data);
    res.json(json.pillars || []);
  });
});

/* ---------------- Home page data ---------------- */

app.get("/api/home", (req, res) => {
  fs.readFile(HOME_DATA_PATH, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read data" });
    res.json(JSON.parse(data));
  });
});

app.get("/api/home/:section", (req, res) => {
  fs.readFile(HOME_DATA_PATH, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read data" });
    const json = JSON.parse(data);
    const section = json[req.params.section];
    if (!section) return res.status(404).json({ error: "Section not found" });
    res.json(section);
  });
});

/* ---------------- Contact page data ---------------- */

app.get("/api/contact", (req, res) => {
  fs.readFile(CONTACT_DATA_PATH, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read data" });
    res.json(JSON.parse(data));
  });
});

app.post("/api/contact/submit", (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newInquiry = {
    id: crypto.randomUUID(), // Generates unique ID for every inquiry
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

/* ---------------- Auth: Sign Up / Log In ---------------- */

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password should be at least 6 characters." });
  }

  const users = readJSON(USERS_PATH, []);

  const existing = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) {
    return res
      .status(409)
      .json({ error: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    role: "client",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeJSON(USERS_PATH, users);

  const token = crypto.randomBytes(24).toString("hex");
  sessions[token] = newUser.id;

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password." });
  }

  const users = readJSON(USERS_PATH, []);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = crypto.randomBytes(24).toString("hex");
  sessions[token] = user.id;

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "client",
    },
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const { id, name, email, role } = req.user;
  res.json({ user: { id, name, email, role: role || "client" } });
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) delete sessions[token];
  res.json({ success: true });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const users = readJSON(USERS_PATH, []);
  const user = users.find(
    (u) => u.email.toLowerCase() === (email || "").toLowerCase(),
  );

  if (!user) {
    return res
      .status(404)
      .json({ error: "No account registered with this email." });
  }

  console.log(
    `Password reset requested for ${email} (no email service configured).`,
  );
  res.json({
    success: true,
    message: "If an account exists, a reset link has been sent.",
  });
});

/* ---------------- ADMIN CRUD ROUTES ---------------- */

// --- 1. SERVICES CRUD ---
app.get("/api/services", (req, res) => {
  res.json(readJSON(SERVICES_DATA_PATH, []));
});

app.post("/api/services", (req, res) => {
  const services = readJSON(SERVICES_DATA_PATH, []);
  const newService = { id: crypto.randomUUID(), ...req.body };
  services.push(newService);
  writeJSON(SERVICES_DATA_PATH, services);
  res.status(201).json(newService);
});

app.put("/api/services/:id", (req, res) => {
  const services = readJSON(SERVICES_DATA_PATH, []);
  const index = services.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Service not found" });
  services[index] = { ...services[index], ...req.body };
  writeJSON(SERVICES_DATA_PATH, services);
  res.json(services[index]);
});

app.delete("/api/services/:id", (req, res) => {
  let services = readJSON(SERVICES_DATA_PATH, []);
  services = services.filter((s) => s.id !== req.params.id);
  writeJSON(SERVICES_DATA_PATH, services);
  res.json({ success: true });
});

// --- 2. PRODUCTS / VEHICLES CRUD ---
app.get("/api/products", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  res.json(data.vehicles || data);
});

app.post("/api/products", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  const vehicles = data.vehicles || data;
  const newVehicle = { id: crypto.randomUUID(), ...req.body };
  vehicles.push(newVehicle);
  data.vehicles = vehicles;
  writeJSON(VEHICLES_DATA_PATH, data);
  res.status(201).json(newVehicle);
});

app.put("/api/products/:id", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  const vehicles = data.vehicles || data;
  const index = vehicles.findIndex((v) => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Vehicle not found" });
  vehicles[index] = { ...vehicles[index], ...req.body };
  data.vehicles = vehicles;
  writeJSON(VEHICLES_DATA_PATH, data);
  res.json(vehicles[index]);
});

app.delete("/api/products/:id", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, { vehicles: [] });
  data.vehicles = (data.vehicles || data).filter((v) => v.id !== req.params.id);
  writeJSON(VEHICLES_DATA_PATH, data);
  res.json({ success: true });
});

// --- 3. INQUIRIES CRUD ---
app.get("/api/contact_inquiries", (req, res) => {
  res.json(readJSON(INQUIRIES_PATH, []));
});

app.delete("/api/contact_inquiries/:id", (req, res) => {
  let inquiries = readJSON(INQUIRIES_PATH, []);
  const targetId = req.params.id;

  inquiries = inquiries.filter((i) => {
    if (i.id && i.id === targetId) return false;
    if (i.submittedAt && i.submittedAt === targetId) return false;
    if (
      i.fullName &&
      (i.fullName === targetId || encodeURIComponent(i.fullName) === targetId)
    )
      return false;
    return true;
  });

  writeJSON(INQUIRIES_PATH, inquiries);
  res.json({ success: true });
});

/* ---------------- Purchase Requests Routes ---------------- */

const handleGetPurchaseRequests = (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  const token = req.headers.authorization?.replace("Bearer ", "");
  let email = req.query.email;

  if (token && sessions[token]) {
    const userId = sessions[token];
    const users = readJSON(USERS_PATH, []);
    const user = users.find((u) => u.id === userId);
    if (user) email = user.email;
  }

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
  const filtered = all.filter((r) => r.id !== req.params.id);
  writeJSON(PURCHASE_REQUESTS_PATH, filtered);
  res.json({ success: true });
};

app.get("/api/admin/purchase-requests", (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  res.json(all);
});

app.put("/api/purchase-requests/:id", (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);
  const index = all.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Request not found" });

  all[index] = { ...all[index], ...req.body };
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

app.delete("/api/purchase_requests/:id", handleDeletePurchaseRequest);
app.delete("/api/purchase-requests/:id", handleDeletePurchaseRequest);

/* ---------------- Start Server (ALWAYS AT THE VERY BOTTOM) ---------------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
