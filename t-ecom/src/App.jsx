import React, { useState } from "react";
import Home from "./components/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import Cart from "./components/Cart.jsx";
import AddProduct from "./components/AddProduct.jsx";
import Product from "./components/Product.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./Context/Context.jsx";
import UpdateProduct from "./components/UpdateProduct.jsx";
import AskAi from "./components/AskAI.jsx";
import SearchResults from "./components/SearchResults.jsx";
import Order from "./components/Order.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
  };

  return (
    <AppProvider>
      <BrowserRouter>
      <ToastContainer autoClose={2000}
  hideProgressBar={true} />
        <Navbar onSelectCategory={handleCategorySelect} />
        <div className="min-vh-100 bg-light">
          <Routes>
            <Route
              path="/"
              element={
                <Home selectedCategory={selectedCategory} />
              }
            />
            <Route path="/add_product" element={<AddProduct />} />
            <Route path="/product" element={<Product />} />
            <Route path="product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/update/:id" element={<UpdateProduct />} />
            <Route path="/askai" element={<AskAi />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/orders" element={<Order />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;