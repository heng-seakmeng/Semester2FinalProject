/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import "./AdminDashboard.css";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

const resolveImgUrl = (src) => {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  const cleanPath = src.replace(/^\.?\//, "");
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

const emptyProductForm = {
  title: "",
  subtitle: "",
  price: "",
  category: "Supercars",
  acceleration: "2.8s",
  topSpeed: "341 km/h",
  power: "720 PS",
  summary: "",
  // One image + one description per detail-page section. Each falls
  // back to the hero image on the detail page if left blank, but
  // filling these in is what lets every section show a different
  // photo and its own writeup instead of repeating the hero image.
  heroImage: "",
  overviewImage: "",
  overviewText: "",
  lightnessImage: "",
  lightnessText: "",
  engagementImage: "",
  engagementText: "",
  powerImage: "",
  powerText: "",
};

export default function AdminDashboard({ navigateTo }) {
  const [activeTab, setActiveTab] = useState("purchaseRequests");

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [serviceForm, setServiceForm] = useState({
    number: "01",
    title: "",
    subtitle: "",
    description: "",
    details: "",
    image: "",
  });

  const [productForm, setProductForm] = useState(emptyProductForm);

  // Draft reply text per inquiry id, keyed so multiple cards can be
  // mid-reply at once without clobbering each other.
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyLoadingId, setReplyLoadingId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [servRes, prodRes, inqRes, reqRes] = await Promise.all([
        fetch(`${API_BASE}/services`),
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/contact_inquiries`, { headers }),
        fetch(`${API_BASE}/admin/purchase-requests`, { headers }),
      ]);

      const servicesData = await servRes.json();
      const productsData = await prodRes.json();
      const inquiriesData = await inqRes.json();
      const requestsData = await reqRes.json();

      setServices(Array.isArray(servicesData) ? servicesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
      setPurchaseRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PURCHASE REQUESTS STATUS UPDATE ---------------- */
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/purchase-requests/${requestId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setPurchaseRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: newStatus } : r,
          ),
        );
      } else {
        const data = await res.json().catch(() => ({}));
        alert(
          data.error || "Failed to update status. Are you logged in as admin?",
        );
      }
    } catch (err) {
      console.error("Error updating request status:", err);
      alert("Could not reach the server. Is it running on port 3000?");
    }
  };

  const handleDeletePurchaseRequest = async (requestId) => {
    if (
      !window.confirm("Are you sure you want to delete this purchase request?")
    )
      return;

    try {
      const res = await fetch(`${API_BASE}/purchase-requests/${requestId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setPurchaseRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete purchase request.");
      }
    } catch (err) {
      console.error("Error deleting purchase request:", err);
      alert("Could not reach the server. Is it running on port 3000?");
    }
  };

  /* ---------------- SERVICES CRUD ---------------- */
  const handleOpenServiceModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setServiceForm({
        number: item.number || "01",
        title: item.title || "",
        subtitle: item.subtitle || "",
        description: item.description || "",
        details: Array.isArray(item.details)
          ? item.details.join("\n")
          : item.details || "",
        image: item.image || "",
      });
    } else {
      setEditingId(null);
      setServiceForm({
        number: `0${services.length + 1}`,
        title: "",
        subtitle: "",
        description: "",
        details: "",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const detailsArray = serviceForm.details
        .split("\n")
        .filter((line) => line.trim() !== "");

      const payload = {
        ...serviceForm,
        details: detailsArray,
      };

      const url = editingId
        ? `${API_BASE}/services/${editingId}`
        : `${API_BASE}/services`;

      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Failed to save service.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    try {
      await fetch(`${API_BASE}/services/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      fetchAllData();
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  /* ---------------- PRODUCTS CRUD ---------------- */
  const handleOpenProductModal = (item = null) => {
    if (item) {
      const perf = item.performance || {};
      const images = item.images || {};
      const fallbackHero = images.hero || images.exterior || item.image || "";

      setEditingId(item.id);
      setProductForm({
        title: item.name || item.title || "",
        subtitle: item.brand || item.subtitle || "",
        price: item.price || "",
        category: item.series || item.category || "Supercars",
        acceleration: perf.acceleration0100 || item.acceleration || "2.8s",
        topSpeed: perf.topSpeed || item.topSpeed || "341 km/h",
        power: perf.horsepower || item.power || "720 PS",
        summary: item.summary || item.description || "",
        heroImage: fallbackHero,
        overviewImage: images.overview || "",
        overviewText: item.overviewText || "",
        lightnessImage: images.lightness || "",
        lightnessText: item.lightnessText || "",
        engagementImage: images.engagement || "",
        engagementText: item.engagementText || "",
        powerImage: images.power || "",
        powerText: item.powerText || "",
      });
    } else {
      setEditingId(null);
      setProductForm(emptyProductForm);
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const f = productForm;

      // Every section falls back to the hero image/summary if left
      // blank, so admins aren't forced to fill in all five images —
      // but filling them in is what makes each section distinct.
      const payload = {
        name: f.title,
        title: f.title,
        brand: f.subtitle || "McLaren",
        subtitle: f.subtitle,
        series: f.category,
        category: f.category,
        price:
          typeof f.price === "number"
            ? `$${f.price.toLocaleString()}`
            : f.price,
        summary: f.summary,
        description: f.summary,
        performance: {
          horsepower: f.power,
          topSpeed: f.topSpeed,
          acceleration0100: f.acceleration,
        },
        images: {
          hero: f.heroImage,
          exterior: f.heroImage,
          overview: f.overviewImage || f.heroImage,
          lightness: f.lightnessImage || f.heroImage,
          engagement: f.engagementImage || f.heroImage,
          power: f.powerImage || f.heroImage,
        },
        image: f.heroImage,
        overviewText: f.overviewText,
        lightnessText: f.lightnessText,
        engagementText: f.engagementText,
        powerText: f.powerText,
      };

      const url = editingId
        ? `${API_BASE}/products/${editingId}`
        : `${API_BASE}/products`;

      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?"))
      return;
    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      fetchAllData();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  /* ---------------- INQUIRIES CRUD ---------------- */
  const handleDeleteInquiry = async (inq) => {
    if (!window.confirm("Delete this inquiry log?")) return;

    const targetIdentifier = inq.id || inq.submittedAt || inq.fullName;
    if (!targetIdentifier) return;

    try {
      const res = await fetch(
        `${API_BASE}/contact_inquiries/${encodeURIComponent(targetIdentifier)}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (res.ok) {
        setInquiries((prev) =>
          prev.filter(
            (item) =>
              (item.id || item.submittedAt || item.fullName) !==
              targetIdentifier,
          ),
        );
        fetchAllData();
      }
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

  const handleReplyDraftChange = (id, value) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendReply = async (inq) => {
    const draft = (replyDrafts[inq.id] ?? "").trim();
    if (!draft) return;

    setReplyLoadingId(inq.id);
    try {
      const res = await fetch(`${API_BASE}/contact_inquiries/${inq.id}/reply`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reply: draft }),
      });

      if (res.ok) {
        const updated = await res.json();
        setInquiries((prev) =>
          prev.map((item) => (item.id === inq.id ? updated : item)),
        );
        setReplyDrafts((prev) => ({ ...prev, [inq.id]: "" }));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to send reply.");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Could not reach the server.");
    } finally {
      setReplyLoadingId(null);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">SYSTEM CONTROL PANEL</span>
          <h1>ADMIN DASHBOARD</h1>
        </div>
        <div className="admin-header-actions">
          <button className="admin-refresh-btn" onClick={fetchAllData}>
            🔄 Refresh
          </button>
          {navigateTo && (
            <button
              className="admin-back-btn"
              onClick={() => navigateTo("home")}
            >
              Exit Admin
            </button>
          )}
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>Purchase Requests</span>
          <strong className="accent-text">
            {purchaseRequests.length} Orders
          </strong>
        </div>
        <div className="admin-stat-card">
          <span>Showroom Inventory</span>
          <strong>{products.length} Vehicles</strong>
        </div>
        <div className="admin-stat-card">
          <span>Active Services</span>
          <strong>{services.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Contact Messages</span>
          <strong>{inquiries.length} Inquiries</strong>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === "purchaseRequests" ? "active" : ""}
          onClick={() => setActiveTab("purchaseRequests")}
        >
          Purchase Requests ({purchaseRequests.length})
        </button>
        <button
          className={activeTab === "services" ? "active" : ""}
          onClick={() => setActiveTab("services")}
        >
          Manage Services ({services.length})
        </button>
        <button
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          Manage Products / Cars ({products.length})
        </button>
        <button
          className={activeTab === "inquiries" ? "active" : ""}
          onClick={() => setActiveTab("inquiries")}
        >
          Contact Messages ({inquiries.length})
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Fetching JSON database collections...</p>
        </div>
      ) : (
        <div className="admin-content-area">
          {/* TAB 1: PURCHASE REQUESTS */}
          {activeTab === "purchaseRequests" && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h3>Supercar Purchase Requests &amp; Orders</h3>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Email</th>
                      <th>Vehicle Requested</th>
                      <th>Region &amp; Color</th>
                      <th>Order Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-td">
                          No purchase requests found. Submit a request from any
                          Vehicle Details page.
                        </td>
                      </tr>
                    ) : (
                      purchaseRequests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <strong>{req.clientName}</strong>
                          </td>
                          <td>{req.clientEmail}</td>
                          <td>
                            <strong className="accent-text">
                              {req.vehicleName || req.carModel}
                            </strong>
                          </td>
                          <td>
                            <small>{req.deliveryRegion || "N/A"}</small>
                            <br />
                            <small className="muted">
                              {req.exteriorColor || "N/A"}
                            </small>
                          </td>
                          <td>
                            <select
                              value={req.status || "Pending Review"}
                              onChange={(e) =>
                                handleUpdateStatus(req.id, e.target.value)
                              }
                              style={{
                                background: "#141414",
                                color: "#f7f6f3",
                                border: "1px solid #333",
                                padding: "4px 8px",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Pending Review">
                                Pending Review
                              </option>
                              <option value="Under Review">Under Review</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="In Production">
                                In Production
                              </option>
                              <option value="Out for Delivery">
                                Out for Delivery
                              </option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                          <td>
                            <button
                              className="btn-delete"
                              onClick={() =>
                                handleDeletePurchaseRequest(req.id)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === "services" && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h3>Services Catalog</h3>
                <button
                  className="admin-add-btn"
                  onClick={() => handleOpenServiceModal()}
                >
                  + Add New Service
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Title</th>
                      <th>Subtitle</th>
                      <th>Details Items</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-td">
                          No services found. Click "+ Add New Service" to create
                          one.
                        </td>
                      </tr>
                    ) : (
                      services.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.number}</strong>
                          </td>
                          <td>
                            <div className="table-item-title">{item.title}</div>
                          </td>
                          <td>{item.subtitle}</td>
                          <td>
                            {Array.isArray(item.details)
                              ? `${item.details.length} Items Listed`
                              : "No details"}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-edit"
                                onClick={() => handleOpenServiceModal(item)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteService(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === "products" && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h3>Supercar Inventory Catalog</h3>
                <button
                  className="admin-add-btn"
                  onClick={() => handleOpenProductModal()}
                >
                  + Add New Vehicle
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Model Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>0-100 km/h</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-td">
                          No vehicle products found in vehicles.json.
                        </td>
                      </tr>
                    ) : (
                      products.map((car) => (
                        <tr key={car.id}>
                          <td>
                            <img
                              src={resolveImgUrl(
                                car.image ||
                                  car.images?.exterior ||
                                  car.images?.hero ||
                                  "cars/mclaren-1.jpg",
                              )}
                              alt={car.title || car.name}
                              className="admin-thumb"
                            />
                          </td>
                          <td>
                            <strong>{car.title || car.name}</strong>
                            <br />
                            <small className="muted">
                              {car.subtitle || car.series}
                            </small>
                          </td>
                          <td>
                            <span className="badge">
                              {car.category || car.series}
                            </span>
                          </td>
                          <td className="accent-text font-bold">{car.price}</td>
                          <td>
                            {car.acceleration ||
                              car.performance?.acceleration0100 ||
                              "2.8s"}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-edit"
                                onClick={() => handleOpenProductModal(car)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteProduct(car.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT MESSAGES */}
          {activeTab === "inquiries" && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h3>Contact Form Messages</h3>
              </div>

              <div className="inquiries-grid">
                {inquiries.length === 0 ? (
                  <p className="empty-block">No contact messages found.</p>
                ) : (
                  inquiries.map((inq, idx) => (
                    <div
                      className="inquiry-card"
                      key={inq.id || inq.submittedAt || idx}
                    >
                      <div className="inquiry-header">
                        <div>
                          <h4>{inq.fullName || "Anonymous Client"}</h4>
                          <span className="inquiry-email">{inq.email}</span>
                        </div>
                        <span className="inquiry-subject">{inq.subject}</span>
                      </div>
                      <p className="inquiry-body">{inq.message}</p>

                      {inq.reply && (
                        <div className="inquiry-reply-existing">
                          <span className="inquiry-reply-label">
                            Your reply
                            {inq.repliedAt
                              ? ` — ${new Date(inq.repliedAt).toLocaleString()}`
                              : ""}
                            :
                          </span>
                          <p>{inq.reply}</p>
                        </div>
                      )}

                      <div className="inquiry-reply-form">
                        <textarea
                          rows={3}
                          placeholder={
                            inq.reply
                              ? "Send a follow-up reply..."
                              : "Write a reply to this client..."
                          }
                          value={replyDrafts[inq.id] ?? ""}
                          onChange={(e) =>
                            handleReplyDraftChange(inq.id, e.target.value)
                          }
                        />
                        <button
                          className="btn-edit"
                          disabled={
                            replyLoadingId === inq.id ||
                            !(replyDrafts[inq.id] ?? "").trim()
                          }
                          onClick={() => handleSendReply(inq)}
                        >
                          {replyLoadingId === inq.id
                            ? "Sending..."
                            : inq.reply
                              ? "Send Follow-up"
                              : "Send Reply"}
                        </button>
                      </div>

                      <div className="inquiry-footer">
                        <span>Phone: {inq.phone || "N/A"}</span>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteInquiry(inq)}
                        >
                          Delete Message
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal for Services & Products */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingId ? "Edit Item" : "Create New Item"} (
                {activeTab === "services" ? "Service" : "Vehicle"})
              </h3>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {activeTab === "services" && (
              <form onSubmit={handleSaveService} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Number (e.g. 01)</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.number}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Test Drive Experience"
                      value={serviceForm.title}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subtitle</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.subtitle}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        subtitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Image URL / Path</label>
                  <input
                    type="text"
                    value={serviceForm.image}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, image: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={4}
                    required
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Details Bullet Points (One item per line)</label>
                  <textarea
                    rows={4}
                    value={serviceForm.details}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        details: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Save Service"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "products" && (
              <form onSubmit={handleSaveProduct} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Model Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.title}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (e.g. $337,195)</label>
                    <input
                      type="text"
                      required
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category / Series</label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option>Supercars</option>
                      <option>Super Series</option>
                      <option>Ultimate Series</option>
                      <option>High-Performance Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Acceleration (0-100 km/h)</label>
                    <input
                      type="text"
                      value={productForm.acceleration}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          acceleration: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Top Speed</label>
                    <input
                      type="text"
                      value={productForm.topSpeed}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          topSpeed: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Power (Horsepower)</label>
                    <input
                      type="text"
                      value={productForm.power}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          power: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Overview Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Short summary shown on the model card / overview intro"
                    value={productForm.summary}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        summary: e.target.value,
                      })
                    }
                  />
                </div>

                <hr />
                <p className="form-section-note">
                  Hero Image — used as the top banner and as the fallback for
                  any section left blank below.
                </p>
                <div className="form-group">
                  <label>Hero Image Path *</label>
                  <input
                    type="text"
                    required
                    value={productForm.heroImage}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        heroImage: e.target.value,
                      })
                    }
                  />
                </div>

                <hr />
                <p className="form-section-note">01 / Overview Section</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Overview Image Path</label>
                    <input
                      type="text"
                      placeholder="Leave blank to reuse hero image"
                      value={productForm.overviewImage}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          overviewImage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Overview Description</label>
                  <textarea
                    rows={3}
                    value={productForm.overviewText}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        overviewText: e.target.value,
                      })
                    }
                  />
                </div>

                <hr />
                <p className="form-section-note">02 / Lightness Section</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Lightness Image Path</label>
                    <input
                      type="text"
                      placeholder="Leave blank to reuse hero image"
                      value={productForm.lightnessImage}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          lightnessImage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Lightness Description</label>
                  <textarea
                    rows={3}
                    value={productForm.lightnessText}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        lightnessText: e.target.value,
                      })
                    }
                  />
                </div>

                <hr />
                <p className="form-section-note">03 / Engagement Section</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Engagement Image Path</label>
                    <input
                      type="text"
                      placeholder="Leave blank to reuse hero image"
                      value={productForm.engagementImage}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          engagementImage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Engagement Description</label>
                  <textarea
                    rows={3}
                    value={productForm.engagementText}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        engagementText: e.target.value,
                      })
                    }
                  />
                </div>

                <hr />
                <p className="form-section-note">04 / Power Section</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Power Image Path</label>
                    <input
                      type="text"
                      placeholder="Leave blank to reuse hero image"
                      value={productForm.powerImage}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          powerImage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Power Description</label>
                  <textarea
                    rows={3}
                    value={productForm.powerText}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        powerText: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Save Vehicle"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
