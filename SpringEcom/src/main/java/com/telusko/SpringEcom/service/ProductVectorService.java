package com.telusko.SpringEcom.service;

import com.telusko.SpringEcom.model.Product;
import com.telusko.SpringEcom.repo.ProductRepo;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.qdrant.QdrantVectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductVectorService implements CommandLineRunner {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private QdrantVectorStore vectorStore;

    public void loadProductsToVectorStore() {

        List<Product> products = productRepo.findAll();

        List<Document> documents = products.stream()
                .map(product -> new Document("""
                        Product Name: %s
                        Brand: %s
                        Category: %s
                        Price: %s
                        Description: %s
                        Available: %s
                        Stock Quantity: %s
                        Release Date: %s
                        """.formatted(
                        product.getName(),
                        product.getBrand(),
                        product.getCategory(),
                        product.getPrice(),
                        product.getDescription(),
                        product.isProductAvailable(),
                        product.getStockQuantity(),
                        product.getReleaseDate()
                )))
                .toList();

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
        }
    }

    @Override
    public void run(String... args) {
        loadProductsToVectorStore();
    }
}