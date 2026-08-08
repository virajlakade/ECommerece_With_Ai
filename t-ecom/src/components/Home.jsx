import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context.jsx";
import unplugged from "../assets/unplugged.png";

const Home = ({ selectedCategory }) => {
  const {
    data,
    isError,
    addToCart,
    refreshData,
  } = useContext(AppContext);

  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  useEffect(() => {
    refreshData();
  }, []);

  // =========================================================
  // DEBUG
  // =========================================================

  useEffect(() => {
    console.log("HOME PRODUCTS:", data);
    console.log("ADD TO CART FUNCTION:", addToCart);
  }, [data, addToCart]);

  // =========================================================
  // TOAST TIMER
  // =========================================================

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showToast]);

  // =========================================================
  // IMAGE CONVERTER
  // =========================================================

  const convertBase64ToDataURL = (
      base64String,
      mimeType = "image/jpeg"
  ) => {
    if (!base64String) {
      return unplugged;
    }

    if (base64String.startsWith("data:")) {
      return base64String;
    }

    if (base64String.startsWith("http")) {
      return base64String;
    }

    return `data:${mimeType};base64,${base64String}`;
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = (product) => {
    console.log("================================");
    console.log("BUTTON CLICK EVENT");
    console.log("ADD TO CART CLICKED");
    console.log("PRODUCT:", product);
    console.log("PRODUCT ID:", product?.id);
    console.log("STOCK:", product?.stockQuantity);
    console.log("ADD TO CART FUNCTION:", addToCart);
    console.log("================================");

    if (!product) {
      console.error("Product is undefined");
      return;
    }

    if (typeof addToCart !== "function") {
      console.error("addToCart is not a function");
      return;
    }

    // Add product to cart
    addToCart(product);

    // Show toast
    setToastProduct(product);
    setShowToast(true);
  };

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = selectedCategory
      ? data.filter(
          (product) =>
              product.category === selectedCategory
      )
      : data;

  // =========================================================
  // ERROR
  // =========================================================

  if (isError) {
    return (
        <div
            className="container d-flex justify-content-center align-items-center"
            style={{ height: "100vh" }}
        >
          <h4>Something went wrong</h4>
        </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
      <>
        {/* =====================================================
          TOAST
      ===================================================== */}

        {showToast && toastProduct && (
            <div
                className="position-fixed top-0 end-0 p-3"
                style={{
                  zIndex: 99999,
                }}
            >
              <div
                  className="toast show"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
              >
                <div className="toast-header">
                  <strong className="me-auto">
                    Added to Cart
                  </strong>

                  <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowToast(false)}
                      aria-label="Close"
                  />
                </div>

                <div className="toast-body d-flex align-items-center">
                  <img
                      src={convertBase64ToDataURL(
                          toastProduct.imageData,
                          toastProduct.imageType ||
                          "image/jpeg"
                      )}
                      alt={toastProduct.name}
                      width="45"
                      height="45"
                      className="rounded me-2"
                      style={{
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.src = unplugged;
                      }}
                  />

                  <div>
                    <strong>
                      {toastProduct.name}
                    </strong>

                    <div>
                      Successfully added to cart!
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* =====================================================
          PRODUCTS
      ===================================================== */}

        <div className="container mt-5 pt-5">

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">

            {!Array.isArray(filteredProducts) ||
            filteredProducts.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <h4>No Products Available</h4>
                </div>
            ) : (
                filteredProducts.map((product) => {
                  const {
                    id,
                    name,
                    brand,
                    price,
                    imageData,
                    imageType,
                    stockQuantity,
                    productAvailable,
                  } = product;

                  return (
                      <div
                          className="col"
                          key={id}
                      >
                        <div
                            className={`card h-100 shadow-sm ${
                                !productAvailable
                                    ? "bg-light"
                                    : ""
                            }`}
                        >

                          {/* =================================================
                        PRODUCT DETAILS LINK
                    ================================================= */}

                          <Link
                              to={`/product/${id}`}
                              className="text-decoration-none text-dark"
                          >
                            <img
                                src={convertBase64ToDataURL(
                                    imageData,
                                    imageType ||
                                    "image/jpeg"
                                )}
                                alt={name}
                                className="card-img-top p-2"
                                style={{
                                  height: "200px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.src = unplugged;
                                }}
                            />

                            <div className="card-body">

                              <h5 className="card-title">
                                {name
                                    ? name.toUpperCase()
                                    : "Product"}
                              </h5>

                              <p className="card-text text-muted fst-italic">
                                ~ {brand}
                              </p>

                              <hr />

                              <h5 className="fw-bold">
                                ₹ {price}
                              </h5>

                              <p className="text-muted mb-0">
                                Stock: {stockQuantity}
                              </p>

                            </div>
                          </Link>

                          {/* =================================================
                        ADD TO CART BUTTON
                    ================================================= */}

                          <div className="card-body pt-0">

                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                style={{
                                  position: "relative",
                                  zIndex: 9999,
                                  pointerEvents: "auto",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  console.log(
                                      "BUTTON CLICK EVENT"
                                  );

                                  handleAddToCart(product);
                                }}
                            >
                              Add to Cart
                            </button>

                          </div>

                        </div>
                      </div>
                  );
                })
            )}

          </div>
        </div>
      </>
  );
};

export default Home;