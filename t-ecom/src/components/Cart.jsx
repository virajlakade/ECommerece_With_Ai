import React, { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context.jsx";
import CheckoutPopup from "./CheckoutPopup.jsx";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

const Cart = () => {
    const {
        cart,
        removeFromCart,
        clearCart,
        addToCart,
    } = useContext(AppContext);

    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // =========================================================
    // SYNC CART FROM CONTEXT
    // =========================================================

    useEffect(() => {
        console.log("Cart from Context:", cart);

        if (Array.isArray(cart)) {
            setCartItems(cart);
        } else {
            setCartItems([]);
        }
    }, [cart]);

    // =========================================================
    // CALCULATE TOTAL
    // =========================================================

    useEffect(() => {
        const total = cartItems.reduce(
            (acc, item) =>
                acc +
                Number(item.price || 0) *
                Number(item.quantity || 1),
            0
        );

        setTotalPrice(total);
    }, [cartItems]);

    // =========================================================
    // IMAGE
    // =========================================================

    const convertBase64ToDataURL = (
        base64String,
        mimeType = "image/jpeg"
    ) => {
        if (!base64String) {
            return "";
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
    // INCREASE QUANTITY
    // =========================================================

    const handleIncreaseQuantity = (item) => {
        const currentQuantity = Number(
            item.quantity || 1
        );

        const stockQuantity = Number(
            item.stockQuantity || 0
        );

        if (currentQuantity >= stockQuantity) {
            toast.info(
                "Cannot add more than available stock"
            );
            return;
        }

        // addToCart automatically increases quantity
        addToCart(item);
    };

    // =========================================================
    // DECREASE QUANTITY
    // =========================================================

    const handleDecreaseQuantity = (item) => {
        const currentQuantity = Number(
            item.quantity || 1
        );

        if (currentQuantity <= 1) {
            return;
        }

        // Remove one quantity from Context cart
        const updatedCart = cart.map((cartItem) => {
            if (cartItem.id === item.id) {
                return {
                    ...cartItem,
                    quantity: currentQuantity - 1,
                };
            }

            return cartItem;
        });

        // Update localStorage and Context indirectly
        localStorage.setItem(
            "cart",
            JSON.stringify(updatedCart)
        );

        // Since Context doesn't currently expose
        // a direct setCart function, reload the page
        // state through localStorage.
        window.location.reload();
    };

    // =========================================================
    // REMOVE FROM CART
    // =========================================================

    const handleRemoveFromCart = (itemId) => {
        removeFromCart(itemId);

        toast.success(
            "Product removed from cart"
        );
    };

    // =========================================================
    // CHECKOUT
    // =========================================================

    const handleCheckout = async () => {
        try {
            if (cartItems.length === 0) {
                toast.info(
                    "Your cart is empty"
                );
                return;
            }

            console.log(
                "Checkout cart:",
                cartItems
            );

            /*
             * CheckoutPopup handles
             * order creation.
             */

            clearCart();

            setCartItems([]);

            setShowModal(false);

        } catch (error) {
            console.error(
                "Error during checkout:",
                error
            );

            toast.error(
                "Checkout failed"
            );
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="container mt-5 pt-5">

            <div className="row">

                <div className="col-12">

                    <h2 className="mb-4">
                        Shopping Cart
                    </h2>

                    {/* =================================================
              EMPTY CART
          ================================================= */}

                    {cartItems.length === 0 ? (

                        <div className="text-center py-5">

                            <h4>
                                Your cart is empty
                            </h4>

                            <Button
                                variant="primary"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                            >
                                Continue Shopping
                            </Button>

                        </div>

                    ) : (

                        <>

                            {/* =================================================
                  CART TABLE
              ================================================= */}

                            <div className="table-responsive">

                                <table className="table align-middle">

                                    <thead>

                                    <tr>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Price
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                    </thead>

                                    <tbody>

                                    {cartItems.map((item) => (

                                        <tr key={item.id}>

                                            {/* =========================================
                            PRODUCT
                        ========================================= */}

                                            <td>

                                                <div className="d-flex align-items-center">

                                                    {item.productImage ? (

                                                        <img
                                                            src={convertBase64ToDataURL(
                                                                item.productImage,
                                                                item.imageType ||
                                                                "image/jpeg"
                                                            )}
                                                            alt={item.name}
                                                            className="rounded me-3"
                                                            width="80"
                                                            height="80"
                                                            style={{
                                                                objectFit: "cover",
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display =
                                                                    "none";
                                                            }}
                                                        />

                                                    ) : (

                                                        <div
                                                            className="rounded me-3 bg-light d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "80px",
                                                                height: "80px",
                                                            }}
                                                        >
                                                            No Image
                                                        </div>

                                                    )}

                                                    <div>

                                                        <strong>
                                                            {item.name}
                                                        </strong>

                                                        <div className="text-muted">
                                                            {item.brand}
                                                        </div>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* =========================================
                            PRICE
                        ========================================= */}

                                            <td>
                                                ₹{" "}
                                                {Number(
                                                    item.price || 0
                                                ).toFixed(2)}
                                            </td>


                                            {/* =========================================
                            QUANTITY
                        ========================================= */}

                                            <td>

                                                <div
                                                    className="input-group input-group-sm"
                                                    style={{
                                                        width: "120px",
                                                    }}
                                                >

                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={() =>
                                                            handleDecreaseQuantity(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            Number(
                                                                item.quantity || 1
                                                            ) <= 1
                                                        }
                                                    >
                                                        -
                                                    </button>


                                                    <input
                                                        type="text"
                                                        className="form-control text-center"
                                                        value={
                                                            item.quantity || 1
                                                        }
                                                        readOnly
                                                    />


                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={() =>
                                                            handleIncreaseQuantity(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            Number(
                                                                item.quantity || 1
                                                            ) >=
                                                            Number(
                                                                item.stockQuantity ||
                                                                0
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            </td>


                                            {/* =========================================
                            TOTAL
                        ========================================= */}

                                            <td>

                                                ₹{" "}
                                                {(
                                                    Number(
                                                        item.price || 0
                                                    ) *
                                                    Number(
                                                        item.quantity || 1
                                                    )
                                                ).toFixed(2)}

                                            </td>


                                            {/* =========================================
                            REMOVE
                        ========================================= */}

                                            <td>

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveFromCart(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                    </tbody>

                                </table>

                            </div>


                            {/* =================================================
                  TOTAL
              ================================================= */}

                            <div className="card mt-3">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <h5 className="mb-0">
                                            Total:
                                        </h5>

                                        <h5 className="mb-0">
                                            ₹{" "}
                                            {totalPrice.toFixed(2)}
                                        </h5>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                  CHECKOUT
              ================================================= */}

                            <div className="d-grid mt-4">

                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() =>
                                        setShowModal(true)
                                    }
                                >
                                    Proceed to Checkout
                                </Button>

                            </div>

                        </>

                    )}

                </div>

            </div>


            {/* =====================================================
          CHECKOUT POPUP
      ===================================================== */}

            <CheckoutPopup
                show={showModal}
                handleClose={() =>
                    setShowModal(false)
                }
                cartItems={cartItems}
                totalPrice={totalPrice}
                handleCheckout={handleCheckout}
            />

        </div>
    );
};

export default Cart;