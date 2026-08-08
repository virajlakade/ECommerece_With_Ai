import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context.jsx";

const Navbar = ({ onSelectCategory }) => {
  const { cart } = useContext(AppContext);

  const navigate = useNavigate();
  const navbarRef = useRef(null);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // =========================================================
  // THEME
  // =========================================================

  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme || "light-theme";
  };

  const [theme, setTheme] = useState(getInitialTheme());

  // =========================================================
  // SEARCH
  // =========================================================

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNoProductsMessage, setShowNoProductsMessage] =
      useState(false);

  // =========================================================
  // CATEGORY
  // =========================================================

  const [selectedCategory, setSelectedCategory] = useState("");

  // =========================================================
  // NAVBAR
  // =========================================================

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // =========================================================
  // CART COUNT
  // =========================================================

  const cartCount = Array.isArray(cart)
      ? cart.reduce(
          (total, item) =>
              total + Number(item.quantity || 0),
          0
      )
      : 0;

  // =========================================================
  // INITIAL DATA
  // =========================================================

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(
          `${baseUrl}/api/products`
      );

      console.log(
          response.data,
          "navbar initial data"
      );
    } catch (error) {
      console.error(
          "Error fetching initial data:",
          error
      );
    }
  };

  // =========================================================
  // CLOSE NAVBAR WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
          navbarRef.current &&
          !navbarRef.current.contains(event.target)
      ) {
        setIsNavCollapsed(true);
      }
    };

    document.addEventListener(
        "mousedown",
        handleClickOutside
    );

    return () => {
      document.removeEventListener(
          "mousedown",
          handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // THEME
  // =========================================================

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme =
        theme === "dark-theme"
            ? "light-theme"
            : "dark-theme";

    setTheme(newTheme);
    localStorage.setItem(
        "theme",
        newTheme
    );
  };

  // =========================================================
  // NAVBAR TOGGLE
  // =========================================================

  const handleNavbarToggle = () => {
    setIsNavCollapsed(
        (previous) => !previous
    );
  };

  const handleLinkClick = () => {
    setIsNavCollapsed(true);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const keyword = input.trim();

    if (!keyword) {
      return;
    }

    setShowNoProductsMessage(false);
    setIsLoading(true);
    setIsNavCollapsed(true);

    try {
      const response = await axios.get(
          `${baseUrl}/api/products/search`,
          {
            params: {
              keyword: keyword,
            },
          }
      );

      const results = Array.isArray(
          response.data
      )
          ? response.data
          : [];

      console.log(
          "Search results:",
          results
      );

      if (results.length === 0) {
        setShowNoProductsMessage(true);
        return;
      }

      navigate("/search-results", {
        state: {
          searchData: results,
        },
      });

    } catch (error) {
      console.error(
          "Error searching:",
          error
      );

      setShowNoProductsMessage(true);

    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // CATEGORY
  // =========================================================

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);

    if (onSelectCategory) {
      onSelectCategory(category);
    }

    setIsNavCollapsed(true);
  };

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    "Laptop",
    "Headphone",
    "Mobile",
    "Electronics",
    "Toys",
    "Fashion",
    "Other",
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
      <nav
          ref={navbarRef}
          className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow-sm"
      >
        <div className="container">

          {/* =====================================================
            BRAND
        ===================================================== */}

          <Link
              to="/"
              className="navbar-brand fw-bold"
              onClick={handleLinkClick}
          >
            Telusko
          </Link>

          {/* =====================================================
            MOBILE TOGGLE
        ===================================================== */}

          <button
              className="navbar-toggler"
              type="button"
              onClick={handleNavbarToggle}
              aria-controls="navbarSupportedContent"
              aria-expanded={!isNavCollapsed}
              aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* =====================================================
            NAVBAR CONTENT
        ===================================================== */}

          <div
              className={`${
                  isNavCollapsed ? "collapse" : ""
              } navbar-collapse`}
              id="navbarSupportedContent"
          >

            {/* =================================================
              NAV LINKS
          ================================================= */}

            <ul className="navbar-nav me-auto mb-2 mb-lg-0">

              <li className="nav-item">
                <Link
                    to="/"
                    className="nav-link"
                    onClick={handleLinkClick}
                >
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link
                    to="/add-product"
                    className="nav-link"
                    onClick={handleLinkClick}
                >
                  Add Product
                </Link>
              </li>

              <li className="nav-item">
                <Link
                    to="/askai"
                    className="nav-link"
                    onClick={handleLinkClick}
                >
                  Ask AI
                </Link>
              </li>

              <li className="nav-item">
                <Link
                    to="/orders"
                    className="nav-link"
                    onClick={handleLinkClick}
                >
                  Orders
                </Link>
              </li>

            </ul>

            {/* =================================================
              RIGHT SIDE
          ================================================= */}

            <div className="d-flex align-items-center">

              {/* CART */}

              <Link
                  to="/cart"
                  className="nav-link text-dark me-3 position-relative"
                  onClick={handleLinkClick}
              >
                <i className="bi bi-cart me-1"></i>

                Cart

                {cartCount > 0 && (
                    <span
                        className="badge bg-danger rounded-pill ms-1"
                    >
                  {cartCount}
                </span>
                )}
              </Link>

              {/* =================================================
                SEARCH
            ================================================= */}

              <form
                  className="d-flex"
                  role="search"
                  onSubmit={handleSubmit}
              >

                <input
                    className="form-control me-2"
                    type="search"
                    placeholder="Type to search"
                    aria-label="Search"
                    value={input}
                    onChange={(e) =>
                        setInput(e.target.value)
                    }
                />

                {isLoading ? (
                    <button
                        className="btn btn-outline-success"
                        type="button"
                        disabled
                    >
                  <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                  ></span>
                    </button>
                ) : (
                    <button
                        className="btn btn-outline-success"
                        type="submit"
                    >
                      Search
                    </button>
                )}

              </form>

            </div>

          </div>
        </div>

        {/* =====================================================
          NO PRODUCTS MESSAGE
      ===================================================== */}

        {showNoProductsMessage && (
            <div
                className="alert alert-warning position-absolute"
                style={{
                  top: "100%",
                  right: "20px",
                  zIndex: 1000,
                }}
            >
              No products found matching your search.

              <button
                  type="button"
                  className="btn-close ms-3"
                  onClick={() =>
                      setShowNoProductsMessage(false)
                  }
              ></button>
            </div>
        )}

      </nav>
  );
};

export default Navbar;