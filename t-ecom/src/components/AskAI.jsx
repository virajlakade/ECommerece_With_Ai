import { useEffect, useState, useCallback } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

function AskAi() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl =
      import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        message: "Hello, I'm your personal AI! How can I help you?",
        sender: "AI",
        direction: "incoming",
      },
    ]);
  }, []);

  const handleSend = useCallback(
      async (messageText) => {
        if (!messageText.trim()) {
          return;
        }

        const userMessage = {
          message: messageText,
          sender: "user",
          direction: "outgoing",
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);
        setError(null);

        try {
          await processMessageToChatGPT(messageText);
        } catch (err) {
          console.error("AI Error:", err);
          setError(err.message || "Something went wrong.");
        } finally {
          setIsTyping(false);
        }
      },
      [baseUrl]
  );

  async function processMessageToChatGPT(chatMessage) {
    const url = `${baseUrl}/api/chat/ask?message=${encodeURIComponent(
        chatMessage
    )}`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      let errMsg = "Failed to get response from TeluskoBot";

      try {
        const errorData = await response.json();

        errMsg =
            errorData.error?.message ||
            errorData.message ||
            errorData.response ||
            errMsg;
      } catch {
        try {
          errMsg = await response.text();
        } catch {
          // Ignore
        }
      }

      throw new Error(errMsg);
    }

    const contentType =
        response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = {
        response: text,
        products: [],
      };
    }

    // Handle backend response
    const botMessage = {
      message:
          typeof data === "string"
              ? data
              : data.response || "I couldn't find a response.",
      sender: "ChatGPT",
      direction: "incoming",
      products:
          typeof data === "object" && Array.isArray(data.products)
              ? data.products
              : [],
    };

    setMessages((prev) => [...prev, botMessage]);
  }

  return (
      <div className="container mt-5 pt-4">
        <div
            className="card shadow"
            style={{
              height: "80vh",
            }}
        >
          {/* Header */}
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-robot me-2"></i>
              AI Assistant
            </h5>
          </div>

          {/* Chat */}
          <div
              className="card-body p-0"
              style={{
                height: "calc(100% - 56px)",
              }}
          >
            <MainContainer style={{ height: "100%" }}>
              <ChatContainer style={{ height: "100%" }}>
                <MessageList
                    scrollBehavior="smooth"
                    typingIndicator={
                      isTyping ? (
                          <TypingIndicator content="AI is typing" />
                      ) : null
                    }
                >
                  {messages.map((m, i) => (
                      <div key={i}>
                        {/* AI/User message */}
                        <Message
                            model={{
                              message: m.message,
                              sender: m.sender,
                              direction: m.direction,
                              position: "single",
                            }}
                            className={m.error ? "error-message" : ""}
                        />

                        {/* Product Cards */}
                        {m.products &&
                            m.products.length > 0 && (
                                <div className="px-3 mt-2 mb-3">
                                  {m.products.map((product) => (
                                      <div
                                          key={product.id}
                                          className="card shadow-sm mb-3"
                                          style={{
                                            maxWidth: "360px",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                          }}
                                      >
                                        {/* Product Image */}
                                        <img
                                            src={`${baseUrl}/api/product/${product.id}/image`}
                                            alt={product.name}
                                            className="card-img-top"
                                            style={{
                                              height: "200px",
                                              width: "100%",
                                              objectFit: "contain",
                                              padding: "10px",
                                              backgroundColor: "#f8f9fa",
                                            }}
                                            onError={(e) => {
                                              e.target.style.display = "none";
                                            }}
                                        />

                                        {/* Product Details */}
                                        <div className="card-body">
                                          <h5 className="card-title mb-2">
                                            {product.name}
                                          </h5>

                                          {product.brand && (
                                              <p className="mb-1">
                                                <strong>Brand:</strong>{" "}
                                                {product.brand}
                                              </p>
                                          )}

                                          {product.category && (
                                              <p className="mb-1">
                                                <strong>Category:</strong>{" "}
                                                {product.category}
                                              </p>
                                          )}

                                          {product.price !== undefined &&
                                              product.price !== null && (
                                                  <p className="mb-3">
                                                    <strong>Price:</strong> ₹
                                                    {product.price}
                                                  </p>
                                              )}

                                          <button
                                              className="btn btn-primary w-100"
                                              onClick={() => {
                                                window.location.href = `/product/${product.id}`;
                                              }}
                                          >
                                            View Product
                                          </button>
                                        </div>
                                      </div>
                                  ))}
                                </div>
                            )}
                      </div>
                  ))}
                </MessageList>

                <MessageInput
                    placeholder="Type your message here..."
                    onSend={handleSend}
                    attachButton={false}
                    disabled={isTyping}
                />
              </ChatContainer>
            </MainContainer>
          </div>

          {/* Error */}
          {error && (
              <div
                  className="alert alert-danger m-3 mb-4"
                  role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
          )}
        </div>
      </div>
  );
}

export default AskAi;