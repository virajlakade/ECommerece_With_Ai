package com.telusko.SpringEcom.controller;

import com.telusko.SpringEcom.model.Product;
import com.telusko.SpringEcom.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;


    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }


    @GetMapping("/product/{id}")
    public ResponseEntity<?> getProductById(
            @PathVariable int id) {

        Product product =
                productService.getProductById(id);

        if (product.getId() > 0) {
            return ResponseEntity.ok(product);
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Product not found");
    }


    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(
            @PathVariable int productId) {

        Product product =
                productService.getProductById(productId);

        if (product.getId() > 0
                && product.getProductImage() != null
                && product.getImageType() != null) {

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    product.getImageType()
                            )
                    )
                    .body(product.getProductImage());
        }

        return ResponseEntity
                .notFound()
                .build();
    }


    @PostMapping(
            value = "/product",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> addProduct(
            @RequestPart("product") Product product,
            @RequestPart("imageFile") MultipartFile imageFile) {

        try {

            Product savedProduct =
                    productService.addOrUpdateProduct(
                            product,
                            imageFile
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedProduct);

        } catch (IOException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }


    @PutMapping(
            value = "/product/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateProduct(
            @PathVariable int id,

            @RequestPart("product")
            Product product,

            @RequestPart(
                    value = "imageFile",
                    required = false
            )
            MultipartFile imageFile) {

        try {

            // IMPORTANT
            product.setId(id);

            Product updatedProduct =
                    productService.addOrUpdateProduct(
                            product,
                            imageFile
                    );

            return ResponseEntity.ok(
                    updatedProduct
            );

        } catch (IOException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }


    @DeleteMapping("/product/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable int id) {

        Product product =
                productService.getProductById(id);

        if (product.getId() > 0) {

            productService.deleteProduct(id);

            return ResponseEntity.ok(
                    "Deleted Successfully"
            );
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Product not found");
    }


    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                productService.searchProducts(keyword)
        );
    }


    @GetMapping("/product/generate-description")
    public ResponseEntity<String> generateDescription(
            @RequestParam String name,
            @RequestParam String category) {

        String description =
                productService.generateDesc(
                        name,
                        category
                );

        return ResponseEntity.ok(description);
    }
}