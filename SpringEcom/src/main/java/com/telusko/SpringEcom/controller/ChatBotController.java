package com.telusko.SpringEcom.controller;

import com.telusko.SpringEcom.service.ChatBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin
public class ChatBotController {

    @Autowired
    private ChatBotService chatBotService;

    @GetMapping("/ask")
    public ResponseEntity<Map<String, Object>> askBot(
            @RequestParam String message) {

        Map<String, Object> response =
                chatBotService.getBotResponse(message);

        return ResponseEntity.ok(response);
    }
}