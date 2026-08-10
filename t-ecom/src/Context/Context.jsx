import axios from "../axios.jsx";
import { useState, useEffect, createContext } from "react";

const AppContext = createContext({
    data: [],
    isError: "",
    cart: [],
    addToCart: () => {},
    removeFromCart: () => {},
    clearCart: () => {},
    refreshData: () => {},
    updateStockQuantity: () => {},
});

export const AppProvider = ({ children }) => {
    const [data, setData] = useState([]);
    const [isError, setIsError] = useState("");

    // =========================================================
    // CART
    // =========================================================

    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem("cart");

            return savedCart
                ? JSON.parse(savedCart)
                : [];
        } catch (error) {
            console.error(
                "Error loading cart from localStorage:",
                error
            );

            return [];
        }
    });

    const baseUrl =
        import.meta.env.VITE_BASE_URL ||
        "http://localhost:8080";

    // =========================================================
    // ADD TO CART
    // =========================================================

    const addToCart = (product) => {
        console.log("ADD TO CART CLICKED:", product);

        if (!product) {
            console.error("Product is undefined");
            return;
        }

        if (!product.id) {
            console.error("Product ID is missing:", product);
            return;
        }

        const stockQuantity = Number(
            product.stockQuantity || 0
        );

        if (stockQuantity <= 0) {
            console.log("Product is out of stock");
            return;
        }

        setCart((previousCart) => {

            const existingProduct =
                previousCart.find(
                    (item) => item.id === product.id
                );

            // =====================================================
            // PRODUCT ALREADY EXISTS
            // =====================================================

            if (existingProduct) {

                const currentQuantity = Number(
                    existingProduct.quantity || 1
                );

                // Don't exceed stock
                if (currentQuantity >= stockQuantity) {

                    console.log(
                        "Cannot add more than available stock"
                    );

                    return previousCart;
                }

                const updatedCart =
                    previousCart.map((item) => {

                        if (item.id === product.id) {

                            return {
                                ...item,
                                quantity:
                                    currentQuantity + 1,

                                // Keep latest product information
                                name: product.name,
                                price: product.price,
                                brand: product.brand,
                                category: product.category,
                                productImage:
                                product.productImage,
                                imageType:
                                product.imageType,
                                stockQuantity:
                                product.stockQuantity,
                            };
                        }

                        return item;
                    });

                console.log(
                    "UPDATED CART:",
                    updatedCart
                );

                return updatedCart;
            }

            // =====================================================
            // NEW PRODUCT
            // =====================================================

            const updatedCart = [
                ...previousCart,
                {
                    ...product,
                    quantity: 1,
                },
            ];

            console.log(
                "NEW CART:",
                updatedCart
            );

            return updatedCart;
        });
    };

    // =========================================================
    // REMOVE FROM CART
    // =========================================================

    const removeFromCart = (productId) => {

        console.log(
            "Removing product:",
            productId
        );

        setCart((previousCart) => {

            const updatedCart =
                previousCart.filter(
                    (item) =>
                        item.id !== productId
                );

            console.log(
                "CART AFTER REMOVE:",
                updatedCart
            );

            return updatedCart;
        });
    };

    // =========================================================
    // CLEAR CART
    // =========================================================

    const clearCart = () => {

        console.log(
            "Clearing cart"
        );

        setCart([]);

        localStorage.removeItem("cart");
    };

    // =========================================================
    // UPDATE STOCK QUANTITY
    // =========================================================

    const updateStockQuantity = (
        productId,
        newQuantity
    ) => {

        setData((previousData) =>
            previousData.map((product) => {

                if (
                    product.id === productId
                ) {

                    return {
                        ...product,
                        stockQuantity:
                        newQuantity,
                    };
                }

                return product;
            })
        );

        setCart((previousCart) =>
            previousCart.map((item) => {

                if (
                    item.id === productId
                ) {

                    return {
                        ...item,
                        stockQuantity:
                        newQuantity,
                    };
                }

                return item;
            })
        );
    };

    // =========================================================
    // REFRESH PRODUCTS
    // =========================================================

    const refreshData = async () => {

        try {

            setIsError("");

            const response =
                await axios.get(
                    `${baseUrl}/api/products`
                );

            console.log(
                "Products fetched:",
                response.data
            );

            setData(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Error fetching products:",
                error
            );

            setIsError(
                error.response?.data ||
                error.message ||
                "Failed to fetch products"
            );
        }
    };

    // =========================================================
    // INITIAL PRODUCT FETCH
    // =========================================================

    useEffect(() => {
        refreshData();
    }, []);

    // =========================================================
    // SAVE CART TO LOCAL STORAGE
    // =========================================================

    useEffect(() => {

        console.log(
            "Saving cart:",
            cart
        );

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    }, [cart]);

    // =========================================================
    // PROVIDER
    // =========================================================

    return (
        <AppContext.Provider
            value={{
                data,
                isError,
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                refreshData,
                updateStockQuantity,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;