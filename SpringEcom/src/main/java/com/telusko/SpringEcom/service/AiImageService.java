/*
package com.telusko.SpringEcom.service;

import org.springframework.ai.image.ImageModel;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.ai.openai.OpenAiImageOptions;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;

@Service
public class AiImageService {

    @Autowired
    private ImageModel imageModel;

    public byte[] generateImage(String prompt) {

        OpenAiImageOptions options = OpenAiImageOptions.builder()
                .model("gpt-image-1")
                .quality("high")
                .N(1)
                .build();

        ImageResponse response =
                imageModel.call(new ImagePrompt(prompt, options));

        String imageUrl = response.getResult().getOutput().getUrl();

        try (InputStream inputStream = new URL(imageUrl).openStream()) {
            return inputStream.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to download generated image", e);
        }
    }
}
*/
