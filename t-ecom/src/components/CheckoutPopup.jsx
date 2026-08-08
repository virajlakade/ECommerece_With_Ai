import axios from "axios";
import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import unplugged from "../assets/unplugged.png";

const CheckoutPopup = ({
                         show,
                         handleClose,
                         cartItems,
                         totalPrice,
                       }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [validated, setValidated] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  // PLACE ORDER
  // =========================================================

  const handleConfirm = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    console.log("================================");
    console.log("CONFIRM PURCHASE CLICKED");
    console.log("CART ITEMS:", cartItems);
    console.log("TOTAL PRICE:", totalPrice);
    console.log("NAME:", name);
    console.log("EMAIL:", email);
    console.log("================================");

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setToastVariant("danger");
      setToastMessage("Your cart is empty.");
      setShowToast(true);
      return;
    }

    setValidated(true);
    setIsSubmitting(true);

    // =========================================================
    // CREATE ORDER ITEMS
    // =========================================================

    const orderItems = cartItems.map((item) => ({
      productId: Number(item.id),
      quantity: Number(item.quantity),
    }));

    // =========================================================
    // ORDER REQUEST
    // =========================================================

    const orderData = {
      customerName: name,
      email: email,
      items: orderItems,
    };

    console.log("ORDER DATA SENT TO BACKEND:");
    console.log(orderData);

    try {
      // =======================================================
      // POST ORDER
      // =======================================================

      const response = await axios.post(
          `${baseUrl}/api/orders/place`,
          orderData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
      );

      console.log("ORDER SUCCESS:");
      console.log(response.data);

      // =======================================================
      // SUCCESS MESSAGE
      // =======================================================

      setToastVariant("success");

      setToastMessage(
          `Order ${response.data.orderId} placed successfully!`
      );

      setShowToast(true);

      // =======================================================
      // CLEAR CART
      // =======================================================

      localStorage.removeItem("cart");

      // Close checkout popup
      handleClose();

      // =======================================================
      // REDIRECT
      // =======================================================

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      console.error("ERROR PLACING ORDER:", error);

      if (error.response) {
        console.error(
            "Backend response:",
            error.response.data
        );

        console.error(
            "Status:",
            error.response.status
        );

        console.error(
            "Headers:",
            error.response.headers
        );
      }

      setToastVariant("danger");

      let message = "Failed to place order.";

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }

      setToastMessage(message);
      setShowToast(true);

    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleModalClose = () => {
    if (isSubmitting) {
      return;
    }

    setValidated(false);
    handleClose();
  };

  // =========================================================
  // UI
  // =========================================================

  return (
      <>
        <Modal
            show={show}
            onHide={handleModalClose}
            centered
        >
          <Form
              noValidate
              validated={validated}
              onSubmit={handleConfirm}
          >

            <Modal.Header closeButton>
              <Modal.Title>
                Checkout
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>

              {/* =================================================
                CART ITEMS
            ================================================= */}

              {cartItems && cartItems.length > 0 ? (
                  <div className="mb-4">

                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="d-flex align-items-center mb-3 p-2 border rounded"
                        >

                          <img
                              src={convertBase64ToDataURL(
                                  item.imageData,
                                  item.imageType ||
                                  "image/jpeg"
                              )}
                              alt={item.name}
                              width="70"
                              height="70"
                              className="rounded me-3"
                              style={{
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.src =
                                    unplugged;
                              }}
                          />

                          <div className="flex-grow-1">

                            <h6 className="mb-1">
                              {item.name}
                            </h6>

                            <div className="text-muted">
                              Quantity:{" "}
                              {item.quantity}
                            </div>

                            <div className="fw-bold">
                              ₹{" "}
                              {(
                                  Number(item.price) *
                                  Number(item.quantity)
                              ).toFixed(2)}
                            </div>

                          </div>

                        </div>
                    ))}

                  </div>
              ) : (
                  <div className="alert alert-warning">
                    Your cart is empty.
                  </div>
              )}

              {/* =================================================
                TOTAL
            ================================================= */}

              <div className="text-center my-4">

                <h5 className="fw-bold">
                  Total: ₹
                  {Number(totalPrice).toFixed(2)}
                </h5>

              </div>

              {/* =================================================
                NAME
            ================================================= */}

              <Form.Group className="mb-3">
                <Form.Label>
                  Name
                </Form.Label>

                <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    required
                    disabled={isSubmitting}
                />

                <Form.Control.Feedback type="invalid">
                  Please provide your name.
                </Form.Control.Feedback>
              </Form.Group>

              {/* =================================================
                EMAIL
            ================================================= */}

              <Form.Group className="mb-3">
                <Form.Label>
                  Email
                </Form.Label>

                <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                    disabled={isSubmitting}
                />

                <Form.Control.Feedback type="invalid">
                  Please provide a valid email address.
                </Form.Control.Feedback>
              </Form.Group>

            </Modal.Body>

            {/* =================================================
              FOOTER
          ================================================= */}

            <Modal.Footer>

              <Button
                  variant="secondary"
                  type="button"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
              >
                Close
              </Button>

              <Button
                  variant="primary"
                  type="submit"
                  disabled={
                      isSubmitting ||
                      !cartItems ||
                      cartItems.length === 0
                  }
              >

                {isSubmitting ? (
                    <>
                  <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                  />

                      Processing...
                    </>
                ) : (
                    "Confirm Purchase"
                )}

              </Button>

            </Modal.Footer>

          </Form>
        </Modal>

        {/* =====================================================
          TOAST
      ===================================================== */}

        <ToastContainer
            position="top-end"
            className="p-3"
            style={{
              zIndex: 1070,
            }}
        >

          <Toast
              show={showToast}
              onClose={() =>
                  setShowToast(false)
              }
              delay={3000}
              autohide
              bg={toastVariant}
          >

            <Toast.Header>
              <strong className="me-auto">
                Order Status
              </strong>
            </Toast.Header>

            <Toast.Body
                className={
                  toastVariant === "success"
                      ? "text-white"
                      : ""
                }
            >
              {toastMessage}
            </Toast.Body>

          </Toast>

        </ToastContainer>
      </>
  );
};

export default CheckoutPopup;