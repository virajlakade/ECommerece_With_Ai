package com.telusko.SpringEcom.service;

import com.telusko.SpringEcom.model.Product;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.qdrant.QdrantVectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatBotService {

    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private QdrantVectorStore vectorStore;

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private ProductService productService;


    public Map<String, Object> getBotResponse(String userQuery) {

        try {

            String promptStringTemplate = Files.readString(
                    resourceLoader
                            .getResource(
                                    "classpath:prompts/chatbot-rag-prompt.st"
                            )
                            .getFile()
                            .toPath()
            );

            List<Document> documents =
                    fetchSemanticDocuments(userQuery);

            StringBuilder context = new StringBuilder();

            for (Document document : documents) {
                context
                        .append(document.getFormattedContent())
                        .append("\n");
            }

            Map<String, Object> variables = new HashMap<>();

            variables.put("userQuery", userQuery);
            variables.put("context", context.toString());

            PromptTemplate promptTemplate =
                    PromptTemplate.builder()
                            .template(promptStringTemplate)
                            .variables(variables)
                            .build();

            String response =
                    chatClient
                            .prompt(promptTemplate.create())
                            .call()
                            .content();


            // Get products from Qdrant metadata
            List<Product> products =
                    documents.stream()
                            .map(document ->
                                    document.getMetadata()
                                            .get("productId"))
                            .filter(id -> id != null)
                            .map(id -> {
                                try {
                                    return productService
                                            .getProductById(
                                                    Integer.parseInt(
                                                            id.toString()
                                                    )
                                            );
                                } catch (Exception e) {
                                    return null;
                                }
                            })
                            .filter(product ->
                                    product != null &&
                                            product.getId() > 0)
                            .distinct()
                            .toList();


            Map<String, Object> result =
                    new HashMap<>();

            result.put("response", response);
            result.put("products", products);

            return result;

        } catch (IOException e) {

            Map<String, Object> result =
                    new HashMap<>();

            result.put(
                    "response",
                    "Bot Failed " + e.getMessage()
            );

            result.put(
                    "products",
                    List.of()
            );

            return result;
        }
    }


    private List<Document> fetchSemanticDocuments(
            String userQuery) {

        return vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(userQuery)
                        .topK(5)
                        .similarityThreshold(0.3f)
                        .build()
        );
    }
}