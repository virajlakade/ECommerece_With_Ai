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

    public ProductService(ProductRepo productRepo, ChatClient chatClient) {
        this.productRepo = productRepo;
        this.chatClient = chatClient;
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
                - Highlight its key features and benefits based on the product name and category.
                - Mention who the product is best suited for.
                - Use a persuasive, customer-friendly tone.
                - Make the description SEO-friendly by naturally including relevant keywords.
                - Do not mention price, brand, stock, or technical specifications unless they can be reasonably inferred from the product name.
                - Do not invent unrealistic or false claims.
                - End with a short call-to-action encouraging customers to explore or purchase the product.

                Return only the product description.
                """, name, category);

        return chatClient.prompt()
                .user(descriptionPrompt)
                .call()
                .content();
    }
}