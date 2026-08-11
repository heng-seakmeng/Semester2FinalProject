/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import "./AdminDashboard.css";

export default function AdminDashboard({ navigateTo }) {
  const [activeTab, setActiveTab] = useState("services"); // 'services' | 'products' | 'inquiries'

  // Data States
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Service Form State
  const [serviceForm, setServiceForm] = useState({
    number: "01",
    title: "",
    subtitle: "",
    description: "",
    details: "",
    image: "",
  });

  // Product (Car) Form State
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

  // Fetch Firestore Data on Mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Services
      const servicesSnap = await getDocs(collection(db, "services"));
      const servicesData = [];
      servicesSnap.forEach((d) => servicesData.push({ id: d.id, ...d.data() }));
      setServices(servicesData);

      // 2. Fetch Products
      const productsSnap = await getDocs(collection(db, "products"));
      const productsData = [];
      productsSnap.forEach((d) => productsData.push({ id: d.id, ...d.data() }));
      setProducts(productsData);

      // 3. Fetch Contact Inquiries
      const inquiriesSnap = await getDocs(collection(db, "contact_inquiries"));
      const inquiriesData = [];
      inquiriesSnap.forEach((d) =>
        inquiriesData.push({ id: d.id, ...d.data() }),
      );
      setInquiries(inquiriesData);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // SERVICES CRUD
  // --------------------------------------------------------------------------
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
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "services", editingId), payload);
      } else {
        await addDoc(collection(db, "services"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
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
      await deleteDoc(doc(db, "services", id));
      fetchAllData();
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  // --------------------------------------------------------------------------
  // PRODUCTS CRUD
  // --------------------------------------------------------------------------
  const handleOpenProductModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setProductForm({
        title: item.title || "",
        subtitle: item.subtitle || "",
        price: item.price || "",
        category: item.category || "Supercars",
        acceleration: item.acceleration || "",
        topSpeed: item.topSpeed || "",
        power: item.power || "",
        image: item.image || "",
        description: item.description || "",
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
        price: Number(productForm.price) || 0,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
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
      await deleteDoc(doc(db, "products", id));
      fetchAllData();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // --------------------------------------------------------------------------
  // INQUIRIES CRUD
  // --------------------------------------------------------------------------
  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Delete this inquiry log?")) return;
    try {
      await deleteDoc(doc(db, "contact_inquiries", id));
      fetchAllData();
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

  return (
    <div className="admin-container">
      {/* HEADER */}
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

      {/* METRICS OVERVIEW */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>Active Services</span>
          <strong>{services.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Showroom Inventory</span>
          <strong>{products.length} Vehicles</strong>
        </div>
        <div className="admin-stat-card">
          <span>Client Inquiries</span>
          <strong className="accent-text">{inquiries.length} Messages</strong>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="admin-tabs">
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
          Client Inquiries ({inquiries.length})
        </button>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Fetching database collections...</p>
        </div>
      ) : (
        <div className="admin-content-area">
          {/* ================================================================ */}
          {/* TAB 1: SERVICES MANAGEMENT */}
          {/* ================================================================ */}
          {activeTab === "services" && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h3>Services Catalog (Contact Page)</h3>
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
                          No services found in database. Click "+ Add New
                          Service" to create one.
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

          {/* ================================================================ */}
          {/* TAB 2: PRODUCTS / CARS MANAGEMENT */}
          {/* ================================================================ */}
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
                          No vehicle products found in database.
                        </td>
                      </tr>
                    ) : (
                      products.map((car) => (
                        <tr key={car.id}>
                          <td>
                            <img
                              src={car.image || "./cars/mclaren-1.jpg"}
                              alt={car.title}
                              className="admin-thumb"
                            />
                          </td>
                          <td>
                            <strong>{car.title}</strong>
                            <br />
                            <small className="muted">{car.subtitle}</small>
                          </td>
                          <td>
                            <span className="badge">{car.category}</span>
                          </td>
                          <td className="accent-text font-bold">
                            ${Number(car.price || 0).toLocaleString()}
                          </td>
                          <td>{car.acceleration}</td>
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

          {/* ================================================================ */}
          {/* TAB 3: CONTACT INQUIRIES */}
          {/* ================================================================ */}
          {activeTab === "inquiries" && (
            <div className="admin-section">
              <div className="section-title-bar">
                <h3>Client Form Submissions</h3>
              </div>

              <div className="inquiries-grid">
                {inquiries.length === 0 ? (
                  <p className="empty-block">No client inquiries found.</p>
                ) : (
                  inquiries.map((inq) => (
                    <div className="inquiry-card" key={inq.id}>
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
                          onClick={() => handleDeleteInquiry(inq.id)}
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

      {/* ================================================================ */}
      {/* MODAL FOR SERVICES / PRODUCTS FORM */}
      {/* ================================================================ */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingId ? "Edit Document" : "Create New Document"} (
                {activeTab === "services" ? "Service" : "Vehicle"})
              </h3>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* FORM FOR SERVICE */}
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
                    placeholder="e.g. Feel the performance firsthand"
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
                    placeholder="./cars/mclaren-1.jpg"
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
                    placeholder="Private session&#10;Full model range available&#10;Specialist on hand"
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

            {/* FORM FOR PRODUCT */}
            {activeTab === "products" && (
              <form onSubmit={handleSaveProduct} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Model Name</label>
                    <input
                      type="text"
                      required
                      placeholder="McLaren 750S"
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
                    <label>Price ($ USD)</label>
                    <input
                      type="number"
                      required
                      placeholder="324000"
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
                    <label>Category</label>
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
                      <option>Ultimate Series</option>
                      <option>GT</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Acceleration (0-100 km/h)</label>
                    <input
                      type="text"
                      placeholder="2.8s"
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
                      placeholder="332 km/h"
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
                    <label>Image Path / URL</label>
                    <input
                      type="text"
                      placeholder="./cars/mclaren-750s.jpg"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
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
