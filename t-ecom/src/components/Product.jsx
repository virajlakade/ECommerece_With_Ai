import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context.jsx";
import axios from "../axios.jsx";
import { toast } from "react-toastify";

const Product = () => {
  const { id } = useParams();

  const {
    data,
    addToCart,
    removeFromCart,
    cart,
    refreshData,
  } = useContext(AppContext);

  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const navigate = useNavigate();

  const baseUrl =
      import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
            `${baseUrl}/api/product/${id}`
        );

        setProduct(response.data);

        console.log("PRODUCT:", response.data);

        if (response.data.imageName) {
          fetchImage();
        }
      } catch (error) {
        console.error(
            "Error fetching product:",
            error
        );
      }
    };

    const fetchImage = async () => {
      try {
        const response = await axios.get(
            `${baseUrl}/api/product/${id}/image`,
            {
              responseType: "blob",
            }
        );

        const url = URL.createObjectURL(
            response.data
        );

        setImageUrl(url);
      } catch (error) {
        console.error(
            "Error fetching product image:",
            error
        );
      }
    };

    fetchProduct();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [id, baseUrl]);

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const deleteProduct = async () => {
    try {
      await axios.delete(
          `${baseUrl}/api/product/${id}`
      );

      removeFromCart(id);

      console.log(
          "Product deleted successfully"
      );

      toast.success(
          "Product deleted successfully"
      );

      refreshData();

      navigate("/");
    } catch (error) {
      console.error(
          "Error deleting product:",
          error
      );

      toast.error(
          "Failed to delete product"
      );
    }
  };

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = () => {
    console.log(
        "ADD TO CART CLICKED"
    );

    console.log(
        "PRODUCT:",
        product
    );

    if (!product) {
      toast.error(
          "Product information not available"
      );
      return;
    }

    if (product.stockQuantity === 0) {
      toast.error(
          "Product is out of stock"
      );
      return;
    }

    if (typeof addToCart !== "function") {
      console.error(
          "addToCart is not a function"
      );

      toast.error(
          "Unable to add product to cart"
      );

      return;
    }

    addToCart(product);

    toast.success(
        "Product added to cart"
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (!product) {
    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
              height: "400px",
            }}
        >
          <h4>Loading...</h4>
        </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
      <div className="container mt-5 pt-5">

        <div className="row">

          {/* ===================================================
            PRODUCT IMAGE
        =================================================== */}

          <div className="col-md-6">

            <img
                src={imageUrl}
                alt={product.name}
                className="card-img-top img-fluid"
                style={{
                  maxHeight: "500px",
                  objectFit: "contain",
                }}
            />

          </div>


          {/* ===================================================
            PRODUCT DETAILS
        =================================================== */}

          <div className="col-md-6">

            <div className="d-flex justify-content-between align-items-center mb-2">

            <span className="badge bg-secondary">
              {product.category}
            </span>

              <small className="text-muted">
                Listed:{" "}
                {new Date(
                    product.releaseDate
                ).toLocaleDateString()}
              </small>

            </div>


            <h2 className="text-capitalize mb-1">
              {product.name}
            </h2>


            <p className="text-muted fst-italic mb-4">
              ~ {product.brand}
            </p>


            {/* =================================================
              DESCRIPTION
          ================================================= */}

            <div className="mb-4">

              <h5 className="mb-2">
                Product Description:
              </h5>

              <p>
                {product.description}
              </p>

            </div>


            {/* =================================================
              PRICE
          ================================================= */}

            <h3 className="fw-bold mb-3">
              ₹ {product.price}
            </h3>


            {/* =================================================
              ADD TO CART
          ================================================= */}

            <div className="d-grid gap-2 mb-3">

              <button
                  className="btn btn-primary btn-lg"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                      product.stockQuantity === 0
                  }
              >
                {product.stockQuantity !== 0
                    ? "Add to Cart"
                    : "Out of Stock"}
              </button>

            </div>


            {/* =================================================
              STOCK
          ================================================= */}

            <p className="mb-4">

            <span className="me-2">
              Stock Available:
            </span>

              <span className="fw-bold text-success">
              {product.stockQuantity}
            </span>

            </p>


            {/* =================================================
              UPDATE / DELETE
          ================================================= */}

            <div className="d-flex gap-2">

              <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={handleEditClick}
              >
                <i className="bi bi-pencil me-1"></i>
                Update
              </button>


              <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={deleteProduct}
              >
                <i className="bi bi-trash me-1"></i>
                Delete
              </button>

            </div>

          </div>

        </div>

      </div>
  );
};

export default Product;