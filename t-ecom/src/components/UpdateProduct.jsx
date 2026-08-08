import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const UpdateProduct = () => {
  const { id } = useParams();

  const [product, setProduct] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  const [imageChanged, setImageChanged] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const navigate = useNavigate();

  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
            `${baseUrl}/api/product/${id}`
        );

        console.log(
            response.data,
            "update product response"
        );

        setProduct(response.data);

        setUpdateProduct({
          ...response.data,
          id: response.data.id,
        });

        // Fetch existing image only for preview
        try {
          const responseImage = await axios.get(
              `${baseUrl}/api/product/${id}/image`,
              {
                responseType: "blob",
              }
          );

          const imageUrl = URL.createObjectURL(
              responseImage.data
          );

          setImagePreview(imageUrl);
        } catch (imageError) {
          console.log(
              "No existing image found",
              imageError
          );
        }

      } catch (error) {
        console.error(
            "Error fetching product:",
            error
        );

        toast.error("Failed to load product");
      }
    };

    fetchProduct();

    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [id, baseUrl]);


  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (e) => {
    if (
        e.target.files &&
        e.target.files.length > 0
    ) {
      const selectedImage =
          e.target.files[0];

      setImage(selectedImage);
      setImageChanged(true);

      // Preview new image
      const previewUrl =
          URL.createObjectURL(selectedImage);

      setImagePreview(previewUrl);
    }
  };


  // =========================================================
  // FORM SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setValidated(true);
    setLoading(true);

    try {

      // =========================================
      // Create FormData
      // =========================================

      const formData = new FormData();

      // Make sure ID is included
      const productData = {
        ...updateProduct,
        id: Number(id),
      };

      console.log(
          "Product data:",
          productData
      );

      // Add Product JSON
      formData.append(
          "product",
          new Blob(
              [JSON.stringify(productData)],
              {
                type: "application/json",
              }
          )
      );

      // =========================================
      // Add image ONLY if user selected new image
      // =========================================

      if (
          imageChanged &&
          image
      ) {
        formData.append(
            "imageFile",
            image
        );
      }

      console.log(
          "FormData:",
          formData
      );

      // =========================================
      // Update product
      // =========================================

      const response = await axios.put(
          `${baseUrl}/api/product/${id}`,
          formData
      );

      console.log(
          "Product updated successfully:",
          response.data
      );

      toast.success(
          "Product updated successfully"
      );

      // Navigate ONLY after successful update
      navigate("/");

    } catch (error) {

      console.error(
          "Error updating product:",
          error
      );

      console.error(
          "Backend response:",
          error.response?.data
      );

      console.error(
          "Status:",
          error.response?.status
      );

      console.error(
          "Headers:",
          error.response?.headers
      );

      toast.error(
          error.response?.data ||
          "Failed to update product. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };


  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setUpdateProduct({
      ...updateProduct,
      [name]: value,
    });
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (!product.id) {
    return (
        <div className="container mt-5 pt-5">
          <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "300px" }}
          >
            <div
                className="spinner-border text-primary"
                role="status"
            >
            <span className="visually-hidden">
              Loading...
            </span>
            </div>
          </div>
        </div>
    );
  }


  // =========================================================
  // UI
  // =========================================================

  return (
      <div className="container mt-5 pt-5">

        <div className="row justify-content-center">

          <div className="col-md-10">

            <div className="card shadow">

              <div className="card-body">

                <h2 className="text-center mb-4">
                  Update Product
                </h2>

                <form
                    className="row g-3"
                    noValidate
                    validated={validated.toString()}
                    onSubmit={handleSubmit}
                >

                  {/* ================= NAME ================= */}

                  <div className="col-md-6">

                    <label
                        htmlFor="name"
                        className="form-label fw-bold"
                    >
                      Name
                    </label>

                    <input
                        type="text"
                        className={`form-control ${
                            validated && errors.name
                                ? "is-invalid"
                                : ""
                        }`}
                        placeholder={product.name}
                        value={
                            updateProduct.name || ""
                        }
                        onChange={handleChange}
                        name="name"
                        id="name"
                        required
                    />

                    {errors.name && (
                        <div className="invalid-feedback">
                          {errors.name}
                        </div>
                    )}

                  </div>


                  {/* ================= BRAND ================= */}

                  <div className="col-md-6">

                    <label
                        htmlFor="brand"
                        className="form-label fw-bold"
                    >
                      Brand
                    </label>

                    <input
                        type="text"
                        name="brand"
                        className={`form-control ${
                            validated && errors.brand
                                ? "is-invalid"
                                : ""
                        }`}
                        placeholder={product.brand}
                        value={
                            updateProduct.brand || ""
                        }
                        onChange={handleChange}
                        id="brand"
                        required
                    />

                    {errors.brand && (
                        <div className="invalid-feedback">
                          {errors.brand}
                        </div>
                    )}

                  </div>


                  {/* ================= DESCRIPTION ================= */}

                  <div className="col-12">

                    <label
                        htmlFor="description"
                        className="form-label fw-bold"
                    >
                      Description
                    </label>

                    <textarea
                        className={`form-control ${
                            validated && errors.description
                                ? "is-invalid"
                                : ""
                        }`}
                        placeholder={product.description}
                        value={
                            updateProduct.description || ""
                        }
                        name="description"
                        onChange={handleChange}
                        id="description"
                        rows="3"
                        required
                    />

                    {errors.description && (
                        <div className="invalid-feedback">
                          {errors.description}
                        </div>
                    )}

                  </div>


                  {/* ================= PRICE ================= */}

                  <div className="col-md-4">

                    <label
                        htmlFor="price"
                        className="form-label fw-bold"
                    >
                      Price
                    </label>

                    <div className="input-group">

                    <span className="input-group-text">
                      Rs
                    </span>

                      <input
                          type="number"
                          className={`form-control ${
                              validated && errors.price
                                  ? "is-invalid"
                                  : ""
                          }`}
                          onChange={handleChange}
                          value={
                              updateProduct.price ?? ""
                          }
                          placeholder={product.price}
                          name="price"
                          id="price"
                          min="0.01"
                          step="0.01"
                          required
                      />

                      {errors.price && (
                          <div className="invalid-feedback">
                            {errors.price}
                          </div>
                      )}

                    </div>

                  </div>


                  {/* ================= CATEGORY ================= */}

                  <div className="col-md-4">

                    <label
                        htmlFor="category"
                        className="form-label fw-bold"
                    >
                      Category
                    </label>

                    <select
                        className={`form-select ${
                            validated && errors.category
                                ? "is-invalid"
                                : ""
                        }`}
                        value={
                            updateProduct.category || ""
                        }
                        onChange={handleChange}
                        name="category"
                        id="category"
                        required
                    >

                      <option value="">
                        Select category
                      </option>

                      <option value="Laptop">
                        Laptop
                      </option>

                      <option value="Headphone">
                        Headphone
                      </option>

                      <option value="Mobile">
                        Mobile
                      </option>

                      <option value="Electronics">
                        Electronics
                      </option>

                      <option value="Toys">
                        Toys
                      </option>

                      <option value="Fashion">
                        Fashion
                      </option>

                    </select>

                    {errors.category && (
                        <div className="invalid-feedback">
                          {errors.category}
                        </div>
                    )}

                  </div>


                  {/* ================= STOCK ================= */}

                  <div className="col-md-4">

                    <label
                        htmlFor="stockQuantity"
                        className="form-label fw-bold"
                    >
                      Stock Quantity
                    </label>

                    <input
                        type="number"
                        className={`form-control ${
                            validated && errors.stockQuantity
                                ? "is-invalid"
                                : ""
                        }`}
                        onChange={handleChange}
                        placeholder={
                          product.stockQuantity
                        }
                        value={
                            updateProduct.stockQuantity ?? ""
                        }
                        name="stockQuantity"
                        id="stockQuantity"
                        min="0"
                        required
                    />

                    {errors.stockQuantity && (
                        <div className="invalid-feedback">
                          {errors.stockQuantity}
                        </div>
                    )}

                  </div>


                  {/* ================= RELEASE DATE ================= */}

                  <div className="col-md-6">

                    <label
                        htmlFor="releaseDate"
                        className="form-label fw-bold"
                    >
                      Release Date
                    </label>

                    <input
                        type="date"
                        className={`form-control ${
                            validated && errors.releaseDate
                                ? "is-invalid"
                                : ""
                        }`}
                        value={
                          updateProduct.releaseDate
                              ? updateProduct.releaseDate.slice(
                                  0,
                                  10
                              )
                              : ""
                        }
                        name="releaseDate"
                        onChange={handleChange}
                        id="releaseDate"
                        required
                    />

                    {errors.releaseDate && (
                        <div className="invalid-feedback">
                          {errors.releaseDate}
                        </div>
                    )}

                  </div>


                  {/* ================= IMAGE ================= */}

                  <div className="col-md-6">

                    <label
                        htmlFor="imageFile"
                        className="form-label fw-bold"
                    >
                      Image
                    </label>

                    {imagePreview && (
                        <div className="mb-2">

                          <img
                              src={imagePreview}
                              alt={product.name}
                              className="img-fluid rounded mb-2"
                              style={{
                                height: "150px",
                                width: "100%",
                                objectFit: "contain",
                              }}
                          />

                        </div>
                    )}

                    <input
                        className={`form-control ${
                            validated && errors.image
                                ? "is-invalid"
                                : ""
                        }`}
                        type="file"
                        onChange={handleImageChange}
                        id="imageFile"
                        accept="image/png, image/jpeg"
                    />

                    {errors.image && (
                        <div className="invalid-feedback">
                          {errors.image}
                        </div>
                    )}

                    <div className="form-text">
                      Leave empty to keep current image
                    </div>

                  </div>


                  {/* ================= AVAILABLE ================= */}

                  <div className="col-12">

                    <div className="form-check">

                      <input
                          className="form-check-input"
                          type="checkbox"
                          name="productAvailable"
                          id="productAvailable"
                          checked={
                            Boolean(
                                updateProduct.productAvailable
                            )
                          }
                          onChange={(e) =>
                              setUpdateProduct({
                                ...updateProduct,
                                productAvailable:
                                e.target.checked,
                              })
                          }
                      />

                      <label
                          className="form-check-label"
                          htmlFor="productAvailable"
                      >
                        Product Available
                      </label>

                    </div>

                  </div>


                  {/* ================= BUTTONS ================= */}

                  <div className="col-12 mt-4">

                    {loading ? (

                        <button
                            className="btn btn-primary"
                            type="button"
                            disabled
                        >

                      <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                      ></span>

                          Updating...

                        </button>

                    ) : (

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                          Update Product
                        </button>

                    )}

                    <button
                        type="button"
                        className="btn btn-outline-secondary ms-2"
                        onClick={() => navigate("/")}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

        </div>

      </div>
  );
};

export default UpdateProduct;