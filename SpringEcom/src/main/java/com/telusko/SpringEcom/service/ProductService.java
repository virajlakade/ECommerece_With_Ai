package com.telusko.SpringEcom.service;

import com.telusko.SpringEcom.model.Product;
import com.telusko.SpringEcom.repo.ProductRepo;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    // private final AiImageService aiImageService;
    private final ProductRepo productRepo;
    private final ChatClient chatClient;

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

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(int id) {
        return productRepo.findById(id).orElse(new Product(-1));
    }

    public Product addOrUpdateProduct(Product product, MultipartFile image) throws IOException {

        product.setImageName(image.getOriginalFilename());
        product.setImageType(image.getContentType());
        product.setProductImage(image.getBytes());

        return productRepo.save(product);
    }

    public void deleteProduct(int id) {
        productRepo.deleteById(id);
    }

    @Transactional
    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }

    // ==========================
    // AI Product Description
    // ==========================
    public String generateDesc(String name, String category) {

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
                """, name, category);

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