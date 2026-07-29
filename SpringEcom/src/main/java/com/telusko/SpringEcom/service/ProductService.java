package com.telusko.SpringEcom.service;

import com.telusko.SpringEcom.model.Product;
import com.telusko.SpringEcom.repo.ProductRepo;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepo productRepo;
    private final ChatClient chatClient;
    private final AiImageService aiImageService;

    public ProductService(ProductRepo productRepo,
                          ChatClient chatClient,
                          AiImageService aiImageService) {
        this.productRepo = productRepo;
        this.chatClient = chatClient;
        this.aiImageService = aiImageService;
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

        String descriptionPrompt = String.format("""
                You are an expert e-commerce copywriter.

                Generate a high-quality product description using only the following information.

                Product Name: %s
                Category: %s

                Instructions:
                - Write a professional and engaging description of 150-200 words.
                - Start with an attractive introduction.
                - Explain what the product is and its primary purpose.
                - Highlight its key features and benefits.
                - Mention who the product is best suited for.
                - Use a persuasive, customer-friendly tone.
                - Make the description SEO-friendly.
                - Do not mention price, brand, or stock.
                - End with a short call-to-action.

                Return only the product description.
                """, name, category);

        return chatClient.prompt()
                .user(descriptionPrompt)
                .call()
                .content();
    }

    // ==========================
    // AI Product Image
    // ==========================
    public byte[] generateImage(String name,
                                String category,
                                String description) {

        String prompt = String.format("""
                Create a professional, realistic e-commerce product image.

                Product Name: %s
                Category: %s
                Description: %s

                Requirements:
                - White background
                - High quality
                - Studio lighting
                - Product centered
                - No watermark
                - No text
                - Premium product photography
                - Suitable for an online shopping website
                """,
                name,
                category,
                description);

        return aiImageService.generateImage(prompt);
    }
}