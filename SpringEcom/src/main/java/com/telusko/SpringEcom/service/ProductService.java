package com.telusko.SpringEcom.service;

import com.telusko.SpringEcom.model.Product;
import com.telusko.SpringEcom.repo.ProductRepo;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProductService {

    // private final AiImageService aiImageService;

    private final ProductRepo productRepo;
    private final ChatClient chatClient;
    @Autowired
    private VectorStore vectorStore;

    /*
    public ProductService(ProductRepo productRepo,
                           ChatClient.Builder chatClientBuilder,
                           AiImageService aiImageService) {

        this.productRepo = productRepo;
        this.chatClient = chatClientBuilder.build();
        this.aiImageService = aiImageService;
    }
    */


    public ProductService(ProductRepo productRepo,
                          ChatClient.Builder chatClientBuilder) {

        this.productRepo = productRepo;
        this.chatClient = chatClientBuilder.build();
    }


    // ==========================
    // Get All Products
    // ==========================

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }


    // ==========================
    // Get Product By ID
    // ==========================

    public Product getProductById(int id) {
        return productRepo.findById(id)
                .orElse(new Product(-1));
    }


    // ==========================
    // Add / Update Product
    // ==========================

    public Product addOrUpdateProduct(
            Product product,
            MultipartFile image) throws IOException {

        /*
         * UPDATE PRODUCT
         *
         * If product ID already exists,
         * get the existing product from database.
         */

        if (product.getId() > 0) {

            Product existingProduct =
                    productRepo.findById(product.getId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found with id: "
                                                    + product.getId()
                                    )
                            );

            /*
             * If user did NOT select a new image,
             * keep the existing image.
             */

            if (image == null || image.isEmpty()) {

                product.setImageName(
                        existingProduct.getImageName()
                );

                product.setImageType(
                        existingProduct.getImageType()
                );

                product.setProductImage(
                        existingProduct.getProductImage()
                );

            } else {

                /*
                 * User selected a new image,
                 * so replace the old image.
                 */

                product.setImageName(
                        image.getOriginalFilename()
                );

                product.setImageType(
                        image.getContentType()
                );

                product.setProductImage(
                        image.getBytes()
                );
            }

        } else {

            /*
             * ADD NEW PRODUCT
             *
             * New products require an image.
             */

            if (image == null || image.isEmpty()) {

                throw new IllegalArgumentException(
                        "Image is required when adding a new product"
                );
            }

            product.setImageName(
                    image.getOriginalFilename()
            );

            product.setImageType(
                    image.getContentType()
            );

            product.setProductImage(
                    image.getBytes()
            );
        }
      Product savedProduct=  productRepo.save(product);
        String content =
                "Product Name: " + savedProduct.getName() + "\n" +
                        "Description: " + savedProduct.getDescription() + "\n" +
                        "Brand: " + savedProduct.getBrand() + "\n" +
                        "Price: " + savedProduct.getPrice() + "\n" +
                        "Category: " + savedProduct.getCategory() + "\n" +
                        "Release Date: " + savedProduct.getReleaseDate() + "\n" +
                        "Product Available: " + savedProduct.isProductAvailable() + "\n" +
                        "Stock Quantity: " + savedProduct.getStockQuantity();

        Document document = new Document(
                UUID.randomUUID().toString(),
                content,
                Map.of("productId", String.valueOf(savedProduct.getId()))
        );
        vectorStore.add(List.of(document));
        return savedProduct;
    }


    // ==========================
    // Delete Product
    // ==========================

    public void deleteProduct(int id) {
        productRepo.deleteById(id);
    }


    // ==========================
    // Search Products
    // ==========================

    @Transactional
    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }


    // ==========================
    // AI Product Description
    // ==========================

    public String generateDesc(
            String name,
            String category) {

        String prompt = String.format("""
                You are an expert e-commerce copywriter.

                Product Name: %s
                Category: %s

                Generate a professional product description of 150-200 words.

                Include:
                - Introduction
                - Features
                - Benefits
                - Target users
                - SEO-friendly content
                - End with a call-to-action

                Return only the description.
                """,
                name,
                category
        );

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }


    // ==========================
    // AI Product Image
    // ==========================

    /*
    public byte[] generateImage(String name,
                                String category,
                                String description) {

        String prompt = String.format("""
                Create a realistic e-commerce product image.

                Product Name: %s
                Category: %s
                Description: %s

                White background.
                Studio lighting.
                Premium product photography.
                No watermark.
                No text.
                """, name, category, description);

        return aiImageService.generateImage(prompt);
    }
    */

}