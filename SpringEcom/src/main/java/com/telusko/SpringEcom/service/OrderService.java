package com.telusko.SpringEcom.service;

import com.telusko.SpringEcom.model.Order;
import com.telusko.SpringEcom.model.OrderItem;
import com.telusko.SpringEcom.model.Product;
import com.telusko.SpringEcom.model.dto.OrderItemRequest;
import com.telusko.SpringEcom.model.dto.OrderItemResponse;
import com.telusko.SpringEcom.model.dto.OrderRequest;
import com.telusko.SpringEcom.model.dto.OrderResponse;
import com.telusko.SpringEcom.repo.OrderRepo;
import com.telusko.SpringEcom.repo.ProductRepo;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private VectorStore vectorStore;


    // =========================================================
    // PLACE ORDER
    // =========================================================

    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {

        Order order = new Order();

        String orderId = "ORD"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();

        order.setOrderId(orderId);
        order.setCustomerName(request.customerName());
        order.setEmail(request.email());
        order.setStatus("PLACED");
        order.setOrderDate(LocalDate.now());

        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.items()) {

            Product product = productRepo.findById(itemReq.productId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: "
                                            + itemReq.productId()
                            )
                    );

            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            product.setStockQuantity(
                    product.getStockQuantity()
                            - itemReq.quantity()
            );

            productRepo.save(product);

            updateProductVector(product);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.quantity())
                    .totalPrice(
                            product.getPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    itemReq.quantity()
                                            )
                                    )
                    )
                    .order(order)
                    .build();

            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);

        Order savedOrder = orderRepo.save(order);

        updateOrderVector(savedOrder);

        return createOrderResponse(savedOrder);
    }


    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    @Transactional
    public List<OrderResponse> getAllOrderResponses() {

        List<Order> orders = orderRepo.findAll();

        List<OrderResponse> orderResponses =
                new ArrayList<>();

        for (Order order : orders) {

            orderResponses.add(
                    createOrderResponse(order)
            );
        }

        return orderResponses;
    }


    // =========================================================
    // UPDATE ORDER
    // =========================================================

    @Transactional
    public OrderResponse updateOrder(
            String orderId,
            OrderRequest request) {

        Order order = orderRepo.findAll()
                .stream()
                .filter(o ->
                        o.getOrderId()
                                .equals(orderId)
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found: "
                                        + orderId
                        )
                );

        // -----------------------------------------
        // Update customer information
        // -----------------------------------------

        order.setCustomerName(
                request.customerName()
        );

        order.setEmail(
                request.email()
        );


        // -----------------------------------------
        // Update items
        // -----------------------------------------

        if (request.items() != null
                && !request.items().isEmpty()) {

            List<OrderItem> oldItems =
                    new ArrayList<>(
                            order.getOrderItems()
                    );


            // Restore old stock
            for (OrderItem oldItem : oldItems) {

                Product oldProduct =
                        oldItem.getProduct();

                oldProduct.setStockQuantity(
                        oldProduct.getStockQuantity()
                                + oldItem.getQuantity()
                );

                productRepo.save(oldProduct);

                updateProductVector(oldProduct);
            }


            // Remove old order items
            order.getOrderItems().clear();


            List<OrderItem> updatedItems =
                    new ArrayList<>();


            // Add new items
            for (OrderItemRequest itemReq :
                    request.items()) {

                Product product =
                        productRepo.findById(
                                itemReq.productId()
                        ).orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found: "
                                                + itemReq.productId()
                                )
                        );


                // Check stock
                if (product.getStockQuantity()
                        < itemReq.quantity()) {

                    throw new RuntimeException(
                            "Insufficient stock for product: "
                                    + product.getName()
                    );
                }


                // Reduce stock
                product.setStockQuantity(
                        product.getStockQuantity()
                                - itemReq.quantity()
                );

                productRepo.save(product);


                // Update Qdrant product vector
                updateProductVector(product);


                // Create order item
                OrderItem orderItem =
                        OrderItem.builder()
                                .product(product)
                                .quantity(
                                        itemReq.quantity()
                                )
                                .totalPrice(
                                        product.getPrice()
                                                .multiply(
                                                        BigDecimal.valueOf(
                                                                itemReq.quantity()
                                                        )
                                                )
                                )
                                .order(order)
                                .build();

                updatedItems.add(orderItem);
            }

            order.setOrderItems(updatedItems);
        }


        // -----------------------------------------
        // Save updated order
        // -----------------------------------------

        Order savedOrder =
                orderRepo.save(order);


        // -----------------------------------------
        // Update Qdrant order vector
        // -----------------------------------------

        updateOrderVector(savedOrder);


        // -----------------------------------------
        // Return response
        // -----------------------------------------

        return createOrderResponse(
                savedOrder
        );
    }


    // =========================================================
    // UPDATE PRODUCT VECTOR
    // =========================================================

    private void updateProductVector(Product product) {

        try {

            String filter = String.format(
                    "productId == %s",
                    String.valueOf(
                            product.getId()
                    )
            );

            vectorStore.delete(filter);


            String updatedContent =
                    String.format(
                            """
                            Product Name: %s
                            Description: %s
                            Brand: %s
                            Category: %s
                            Price: %.2f
                            Release Date: %s
                            Available: %s
                            Stock: %s
                            """,

                            product.getName(),
                            product.getDescription(),
                            product.getBrand(),
                            product.getCategory(),
                            product.getPrice(),
                            product.getReleaseDate(),
                            product.isProductAvailable(),
                            product.getStockQuantity()
                    );


            Document updatedDocument =
                    new Document(
                            UUID.randomUUID()
                                    .toString(),

                            updatedContent,

                            Map.of(
                                    "productId",
                                    String.valueOf(
                                            product.getId()
                                    )
                            )
                    );


            vectorStore.add(
                    List.of(updatedDocument)
            );

        } catch (Exception e) {

            System.err.println(
                    "Error updating product vector: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // UPDATE ORDER VECTOR
    // =========================================================

    private void updateOrderVector(Order order) {

        try {

            String filter = String.format(
                    "orderId == '%s'",
                    order.getOrderId()
            );

            vectorStore.delete(filter);


            StringBuilder content =
                    new StringBuilder();

            content.append(
                    "Order Summary:\n"
            );

            content.append(
                    "Order ID: "
            ).append(
                    order.getOrderId()
            ).append("\n");

            content.append(
                    "Customer: "
            ).append(
                    order.getCustomerName()
            ).append("\n");

            content.append(
                    "Email: "
            ).append(
                    order.getEmail()
            ).append("\n");

            content.append(
                    "Date: "
            ).append(
                    order.getOrderDate()
            ).append("\n");

            content.append(
                    "Status: "
            ).append(
                    order.getStatus()
            ).append("\n");

            content.append(
                    "Products:\n"
            );


            for (OrderItem item :
                    order.getOrderItems()) {

                content.append("- ")
                        .append(
                                item.getProduct()
                                        .getName()
                        )
                        .append(" x ")
                        .append(
                                item.getQuantity()
                        )
                        .append(" = ")
                        .append(
                                item.getTotalPrice()
                        )
                        .append("\n");
            }


            Document document =
                    new Document(
                            UUID.randomUUID()
                                    .toString(),

                            content.toString(),

                            Map.of(
                                    "orderId",
                                    order.getOrderId()
                            )
                    );


            vectorStore.add(
                    List.of(document)
            );

        } catch (Exception e) {

            System.err.println(
                    "Error updating order vector: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // CREATE ORDER RESPONSE
    // =========================================================

    private OrderResponse createOrderResponse(
            Order order) {

        List<OrderItemResponse> itemResponses =
                new ArrayList<>();

        for (OrderItem item :
                order.getOrderItems()) {

            OrderItemResponse itemResponse =
                    new OrderItemResponse(
                            item.getProduct()
                                    .getName(),

                            item.getQuantity(),

                            item.getTotalPrice()
                    );

            itemResponses.add(
                    itemResponse
            );
        }


        return new OrderResponse(
                order.getOrderId(),
                order.getCustomerName(),
                order.getEmail(),
                order.getStatus(),
                order.getOrderDate(),
                itemResponses
        );
    }
}