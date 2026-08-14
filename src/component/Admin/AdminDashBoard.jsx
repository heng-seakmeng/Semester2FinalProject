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

  const [productForm, setProductForm] = useState({
    title: "",
    subtitle: "",
    price: "",
    category: "Supercars",
    acceleration: "2.8s",
    topSpeed: "341 km/h",
    power: "720 PS",
    image: "",
    description: "",
  });

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
      }
    } catch (err) {
      console.error("Error updating request status:", err);
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
      }
    } catch (err) {
      console.error("Error deleting purchase request:", err);
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
      setEditingId(item.id);
      setProductForm({
        title: item.title || item.name || "",
        subtitle: item.subtitle || item.series || "",
        price: item.price || "",
        category: item.category || item.series || "Supercars",
        acceleration:
          item.acceleration || item.performance?.acceleration || "2.8s",
        topSpeed: item.topSpeed || item.performance?.topSpeed || "341 km/h",
        power: item.power || item.performance?.horsepower || "720 PS",
        image: item.image || item.images?.exterior || "",
        description: item.description || item.summary || "",
      });
    } else {
      setEditingId(null);
      setProductForm({
        title: "",
        subtitle: "",
        price: "",
        category: "Supercars",
        acceleration: "2.8s",
        topSpeed: "341 km/h",
        power: "720 PS",
        image: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...productForm,
        name: productForm.title,
        series: productForm.category,
        price:
          typeof productForm.price === "number"
            ? `$${productForm.price.toLocaleString()}`
            : productForm.price,
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

                <div className="form-group">
                  <label>Image Path</label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        image: e.target.value,
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
