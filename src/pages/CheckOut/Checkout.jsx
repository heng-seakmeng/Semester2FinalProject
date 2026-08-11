import { useState } from "react";
import { db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import "./Checkout.css";

export default function Checkout({ cart, user, clearCart, navigateTo }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user.isLoggedIn) {
      alert(
        "Please sign in or create an account before authorizing allocation reservations.",
      );
      navigateTo("account");
      return;
    }

    try {
      // 1. Build database payload
      const orderId = `MCL-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderPayload = {
        userId: user.uid,
        trackingNumber: orderId,
        totalAmount: subtotal,
        status: "pending",
        shippingAddress: { street, city, zip },
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
        })),
        createdAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      // 2. Push to Firestore "orders" collection
      await setDoc(doc(db, "orders", orderId), orderPayload);

      // 3. Complete and clear state
      alert(
        `Reservation Authorized. Order Tracking Number: ${orderId}. A representative will contact you shortly.`,
      );
      clearCart();
      navigateTo("account");
    } catch (err) {
      console.error("Error creating reservation order: ", err);
      alert("Error processing your reservation. Please try again.");
    }
  };

  return (
    <div className="checkout-layout">
      <div className="checkout-header-banner">
        <h1>SECURE RESERVATION CHECKOUT</h1>
        <p>
          Complete your allocation parameters below to secure your production
          build slot.
        </p>
      </div>

      <div className="checkout-columns-container">
        <form onSubmit={handleCheckoutSubmit} className="checkout-inputs-form">
          <div className="checkout-form-section">
            <h2>1. Shipping Coordinates</h2>
            <div className="form-fields-row">
              <div className="checkout-form-field">
                <label>First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="checkout-form-field">
                <label>Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="checkout-form-field">
              <label>Street Address</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div className="form-fields-row">
              <div className="checkout-form-field">
                <label>City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="checkout-form-field">
                <label>Zip Code</label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="checkout-form-section">
            <h2>2. Payment Information</h2>
            <div className="checkout-form-field">
              <label>Cardholder Name</label>
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="checkout-form-field">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="form-fields-row">
              <div className="checkout-form-field">
                <label>Expiration</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  required
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                />
              </div>
              <div className="checkout-form-field">
                <label>CVC Code</label>
                <input
                  type="password"
                  required
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-checkout-btn">
            Authorize Spec Reservation
          </button>
        </form>

        <div className="checkout-summary-column">
          <h2>YOUR ALLOCATION</h2>
          <div className="checkout-mini-list">
            {cart.map((item) => (
              <div className="checkout-mini-row" key={item.id}>
                <span>{item.name}</span>
                <strong>${item.price.toLocaleString()}</strong>
              </div>
            ))}
          </div>
          <div className="checkout-final-sum">
            <span>Estimated Total:</span>
            <strong>${subtotal.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
