import "./Cart.css";

export default function Cart({ cart, removeFromCart, navigateTo }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="showroom-cart-view">
      <div className="cart-header-section">
        <h1>YOUR DIGITAL CART</h1>
        <p>Review the details of your selected vehicle specifications below.</p>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty-panel">
          <p>Your dynamic selection portfolio is currently empty.</p>
          <button
            className="showroom-return-btn"
            onClick={() => navigateTo("models")}
          >
            Explore Showroom
          </button>
        </div>
      ) : (
        <div className="cart-grid-columns">
          <div className="cart-items-list">
            {cart.map((item) => (
              <div className="cart-item-row" key={item.id}>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>
                    {item.performance.engine} | {item.performance.horsepower}
                  </p>
                </div>
                <div className="cart-item-pricing">
                  <span>${item.price.toLocaleString()}</span>
                  <button
                    className="item-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove Spec
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-calculation-panel">
            <h2>SUMMARY</h2>
            <div className="calculation-row">
              <span>Estimated Base Price:</span>
              <strong>${subtotal.toLocaleString()}</strong>
            </div>
            <button
              className="checkout-trigger-btn"
              onClick={() => navigateTo("checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
