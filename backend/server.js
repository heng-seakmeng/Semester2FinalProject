const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const app = express();

// Render provides PORT through environment variables.
// Locally, it will use port 3000.
const PORT = process.env.PORT || 3000;

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://heng-seakmeng.github.io",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // such as Postman, curl, or server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

/* =========================================================
   FILE PATHS
========================================================= */

const DATA_DIR = path.join(__dirname, "data");

const HOME_DATA_PATH = path.join(DATA_DIR, "home.json");
const CONTACT_DATA_PATH = path.join(DATA_DIR, "contact.json");
const INQUIRIES_PATH = path.join(DATA_DIR, "contact_inquiries.json");
const USERS_PATH = path.join(DATA_DIR, "users.json");
const PURCHASE_REQUESTS_PATH = path.join(DATA_DIR, "purchase_requests.json");
const VEHICLES_DATA_PATH = path.join(DATA_DIR, "vehicles.json");
const ABOUT_DATA_PATH = path.join(DATA_DIR, "about.json");
const SERVICES_DATA_PATH = path.join(DATA_DIR, "services.json");

/* =========================================================
   MAKE SURE DATA DIRECTORY EXISTS
========================================================= */

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/* =========================================================
   BASIC ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "McLaren Backend API is running!",
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   HELPERS
========================================================= */

function readJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    const data = fs.readFileSync(filePath, "utf-8");

    if (!data.trim()) {
      return fallback;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file: ${filePath}`);
    console.error(error.message);

    return fallback;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    return true;
  } catch (error) {
    console.error(`Error writing JSON file: ${filePath}`);
    console.error(error.message);

    return false;
  }
}

/* =========================================================
   IN-MEMORY SESSION STORE
========================================================= */

// token -> userId
const sessions = {};

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return res.status(401).json({
      error: "Not authenticated.",
    });
  }

  const userId = sessions[token];

  if (!userId) {
    return res.status(401).json({
      error: "Not authenticated.",
    });
  }

  const users = readJSON(USERS_PATH, []);

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(401).json({
      error: "Not authenticated.",
    });
  }

  req.user = user;
  req.token = token;

  next();
}

/* =========================================================
   ADMIN MIDDLEWARE
========================================================= */

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    const email = req.user?.email?.toLowerCase();

    const isAdmin =
      req.user?.role === "admin" ||
      email === "admin@mclaren.com" ||
      email === "ronalheng832@gmail.com";

    if (!isAdmin) {
      return res.status(403).json({
        error: "Access denied. Admin privileges required.",
      });
    }

    next();
  });
}

/* =========================================================
   ABOUT PAGE
========================================================= */

app.get("/api/about", (req, res) => {
  const data = readJSON(ABOUT_DATA_PATH, null);

  if (!data) {
    return res.status(500).json({
      error: "Failed to read about data",
    });
  }

  res.json(data);
});

/* =========================================================
   VEHICLES / MODELS
========================================================= */

app.get("/api/vehicles", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, {
    vehicles: [],
  });

  res.json(data.vehicles || data);
});

app.get("/api/vehicles/:id", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, {
    vehicles: [],
  });

  const vehicles = data.vehicles || data;

  const vehicle = vehicles.find((v) => String(v.id) === String(req.params.id));

  if (!vehicle) {
    return res.status(404).json({
      error: "Vehicle not found",
    });
  }

  res.json(vehicle);
});

/* =========================================================
   PILLARS
========================================================= */

app.get("/api/pillars", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, {
    pillars: [],
  });

  res.json(data.pillars || []);
});

/* =========================================================
   HOME PAGE
========================================================= */

app.get("/api/home", (req, res) => {
  const data = readJSON(HOME_DATA_PATH, null);

  if (!data) {
    return res.status(500).json({
      error: "Failed to read home data",
    });
  }

  res.json(data);
});

app.get("/api/home/:section", (req, res) => {
  const data = readJSON(HOME_DATA_PATH, null);

  if (!data) {
    return res.status(500).json({
      error: "Failed to read home data",
    });
  }

  const section = data[req.params.section];

  if (!section) {
    return res.status(404).json({
      error: "Section not found",
    });
  }

  res.json(section);
});

/* =========================================================
   CONTACT PAGE
========================================================= */

app.get("/api/contact", (req, res) => {
  const data = readJSON(CONTACT_DATA_PATH, null);

  if (!data) {
    return res.status(500).json({
      error: "Failed to read contact data",
    });
  }

  res.json(data);
});

/* =========================================================
   CONTACT FORM SUBMISSION
========================================================= */

app.post("/api/contact/submit", (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({
      error: "Missing required fields",
    });
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

  const saved = writeJSON(INQUIRIES_PATH, inquiries);

  if (!saved) {
    return res.status(500).json({
      error: "Failed to save inquiry",
    });
  }

  res.status(201).json({
    success: true,
    inquiry: newInquiry,
  });
});

/* =========================================================
   AUTH - SIGN UP
========================================================= */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password should be at least 6 characters.",
      });
    }

    const users = readJSON(USERS_PATH, []);

    const normalizedEmail = email.trim().toLowerCase();

    const existing = users.find(
      (u) => u.email?.toLowerCase() === normalizedEmail,
    );

    if (existing) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "client",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const saved = writeJSON(USERS_PATH, users);

    if (!saved) {
      return res.status(500).json({
        error: "Failed to create account.",
      });
    }

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
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      error: "Failed to create account.",
    });
  }
});

/* =========================================================
   AUTH - LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing email or password.",
      });
    }

    const users = readJSON(USERS_PATH, []);

    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find((u) => u.email?.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
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
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Login failed.",
    });
  }
});

/* =========================================================
   AUTH - CURRENT USER
========================================================= */

app.get("/api/auth/me", requireAuth, (req, res) => {
  const { id, name, email, role } = req.user;

  res.json({
    user: {
      id,
      name,
      email,
      role: role || "client",
    },
  });
});

/* =========================================================
   AUTH - LOGOUT
========================================================= */

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (token) {
    delete sessions[token];
  }

  res.json({
    success: true,
  });
});

/* =========================================================
   AUTH - FORGOT PASSWORD
========================================================= */

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;

  const users = readJSON(USERS_PATH, []);

  const normalizedEmail = (email || "").trim().toLowerCase();

  const user = users.find((u) => u.email?.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({
      error: "No account registered with this email.",
    });
  }

  console.log(
    `Password reset requested for ${email} (no email service configured).`,
  );

  res.json({
    success: true,
    message: "If an account exists, a reset link has been sent.",
  });
});

/* =========================================================
   SERVICES CRUD
========================================================= */

app.get("/api/services", (req, res) => {
  const services = readJSON(SERVICES_DATA_PATH, []);

  res.json(services);
});

app.post("/api/services", requireAdmin, (req, res) => {
  const services = readJSON(SERVICES_DATA_PATH, []);

  const newService = {
    id: crypto.randomUUID(),
    ...req.body,
  };

  services.push(newService);

  const saved = writeJSON(SERVICES_DATA_PATH, services);

  if (!saved) {
    return res.status(500).json({
      error: "Failed to save service",
    });
  }

  res.status(201).json(newService);
});

app.put("/api/services/:id", requireAdmin, (req, res) => {
  const services = readJSON(SERVICES_DATA_PATH, []);

  const index = services.findIndex(
    (s) => String(s.id) === String(req.params.id),
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Service not found",
    });
  }

  services[index] = {
    ...services[index],
    ...req.body,
  };

  writeJSON(SERVICES_DATA_PATH, services);

  res.json(services[index]);
});

app.delete("/api/services/:id", requireAdmin, (req, res) => {
  let services = readJSON(SERVICES_DATA_PATH, []);

  services = services.filter((s) => String(s.id) !== String(req.params.id));

  writeJSON(SERVICES_DATA_PATH, services);

  res.json({
    success: true,
  });
});

/* =========================================================
   PRODUCTS / VEHICLES CRUD
========================================================= */

app.get("/api/products", (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, {
    vehicles: [],
  });

  res.json(data.vehicles || data);
});

app.post("/api/products", requireAdmin, (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, {
    vehicles: [],
  });

  const vehicles = data.vehicles || data;

  const newVehicle = {
    id: crypto.randomUUID(),
    ...req.body,
  };

  vehicles.push(newVehicle);

  data.vehicles = vehicles;

  const saved = writeJSON(VEHICLES_DATA_PATH, data);

  if (!saved) {
    return res.status(500).json({
      error: "Failed to save vehicle",
    });
  }

  res.status(201).json(newVehicle);
});

app.put("/api/products/:id", requireAdmin, (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, {
    vehicles: [],
  });

  const vehicles = data.vehicles || data;

  const index = vehicles.findIndex(
    (v) => String(v.id) === String(req.params.id),
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Vehicle not found",
    });
  }

  vehicles[index] = {
    ...vehicles[index],
    ...req.body,
  };

  data.vehicles = vehicles;

  writeJSON(VEHICLES_DATA_PATH, data);

  res.json(vehicles[index]);
});

app.delete("/api/products/:id", requireAdmin, (req, res) => {
  const data = readJSON(VEHICLES_DATA_PATH, {
    vehicles: [],
  });

  data.vehicles = (data.vehicles || []).filter(
    (v) => String(v.id) !== String(req.params.id),
  );

  writeJSON(VEHICLES_DATA_PATH, data);

  res.json({
    success: true,
  });
});

/* =========================================================
   CONTACT INQUIRIES
========================================================= */

app.get("/api/contact_inquiries", requireAdmin, (req, res) => {
  const inquiries = readJSON(INQUIRIES_PATH, []);

  res.json(inquiries);
});

app.delete("/api/contact_inquiries/:id", requireAdmin, (req, res) => {
  let inquiries = readJSON(INQUIRIES_PATH, []);

  const targetId = req.params.id;

  inquiries = inquiries.filter((i) => {
    if (i.id && i.id === targetId) {
      return false;
    }

    if (i.submittedAt && i.submittedAt === targetId) {
      return false;
    }

    if (
      i.fullName &&
      (i.fullName === targetId || encodeURIComponent(i.fullName) === targetId)
    ) {
      return false;
    }

    return true;
  });

  writeJSON(INQUIRIES_PATH, inquiries);

  res.json({
    success: true,
  });
});

/* =========================================================
   PURCHASE REQUESTS
========================================================= */

function getUserFromToken(req) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return null;
  }

  const userId = sessions[token];

  if (!userId) {
    return null;
  }

  const users = readJSON(USERS_PATH, []);

  return users.find((u) => u.id === userId) || null;
}

const handleGetPurchaseRequests = (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);

  const user = getUserFromToken(req);

  let email = req.query.email;

  if (user) {
    email = user.email;
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

  const filtered = all.filter((r) => String(r.id) !== String(req.params.id));

  writeJSON(PURCHASE_REQUESTS_PATH, filtered);

  res.json({
    success: true,
  });
};

/* ---------------- Admin Purchase Requests ---------------- */

app.get("/api/admin/purchase-requests", requireAdmin, (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);

  res.json(all);
});

/* ---------------- Update Purchase Request ---------------- */

app.put("/api/purchase-requests/:id", requireAdmin, (req, res) => {
  const all = readJSON(PURCHASE_REQUESTS_PATH, []);

  const index = all.findIndex((r) => String(r.id) === String(req.params.id));

  if (index === -1) {
    return res.status(404).json({
      error: "Request not found",
    });
  }

  all[index] = {
    ...all[index],
    ...req.body,
  };

  writeJSON(PURCHASE_REQUESTS_PATH, all);

  res.json(all[index]);
});

/* ---------------- Get Purchase Requests ---------------- */

app.get("/api/purchase_requests", handleGetPurchaseRequests);

app.get("/api/purchase-requests", handleGetPurchaseRequests);

/* ---------------- Create Purchase Request ---------------- */

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
    return res.status(400).json({
      error: "Missing required fields.",
    });
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

  const saved = writeJSON(PURCHASE_REQUESTS_PATH, all);

  if (!saved) {
    return res.status(500).json({
      error: "Failed to save purchase request.",
    });
  }

  res.status(201).json(newRequest);
});

/* ---------------- Delete Purchase Request ---------------- */

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

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS policy blocked this request.",
    });
  }

  res.status(500).json({
    error: "Internal server error",
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(`McLaren Backend API running on port ${PORT}`);
});
