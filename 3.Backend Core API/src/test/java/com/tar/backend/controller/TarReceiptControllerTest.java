package com.tar.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tar.backend.dto.*;
import com.tar.backend.service.TarReceiptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test for TarReceiptController
 */
@WebMvcTest(TarReceiptController.class)
class TarReceiptControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TarReceiptService receiptService;

    @Autowired
    private ObjectMapper objectMapper;

    private IssueReceiptRequest issueRequest;
    private IssueReceiptResponse issueResponse;

    @BeforeEach
    void setUp() {
        issueRequest = new IssueReceiptRequest(
                "INV-001",
                LocalDate.of(2024, 1, 1),
                new BigDecimal("1000.00"),
                "Test Item",
                "0x1234567890123456789012345678901234567890",
                null);

        issueResponse = IssueReceiptResponse.success(
                1L,
                "0x9876543210987654321098765432109876543210987654321098765432109876",
                "https://metadata.example.com/1",
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
                "0x1234567890123456789012345678901234567890");
    }

    @Test
    @WithMockUser
    void testIssueReceipt_Success() throws Exception {
        when(receiptService.issueReceipt(any(IssueReceiptRequest.class)))
                .thenReturn(issueResponse);

        mockMvc.perform(post("/api/v1/receipts/issue")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(issueRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.tokenId").value(1))
                .andExpect(jsonPath("$.message").value("Receipt issued successfully"));
    }

    @Test
    @WithMockUser
    void testIssueReceipt_ValidationFailure() throws Exception {
        IssueReceiptRequest invalidRequest = new IssueReceiptRequest();
        invalidRequest.setInvoiceNo("");
        invalidRequest.setOwnerAddress("invalid-address");

        mockMvc.perform(post("/api/v1/receipts/issue")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testVerifyReceipt_Valid() throws Exception {
        VerifyReceiptRequest verifyRequest = new VerifyReceiptRequest(
                1L,
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");

        VerifyReceiptResponse verifyResponse = VerifyReceiptResponse.valid(
                1L,
                "0x1234567890123456789012345678901234567890",
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");

        when(receiptService.verifyReceipt(any(VerifyReceiptRequest.class)))
                .thenReturn(verifyResponse);

        mockMvc.perform(post("/api/v1/receipts/verify")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.message").value("Receipt is valid"));
    }

    @Test
    @WithMockUser
    void testRevokeReceipt_Success() throws Exception {
        mockMvc.perform(post("/api/v1/receipts/1/revoke")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Receipt revoked successfully"));
    }

    @Test
    @WithMockUser
    void testGetReceiptDetails() throws Exception {
        ReceiptDetailsResponse detailsResponse = new ReceiptDetailsResponse();
        detailsResponse.setTokenId(1L);
        detailsResponse.setInvoiceNo("INV-001");
        detailsResponse.setItemName("Test Item");

        when(receiptService.getReceiptDetails(1L)).thenReturn(detailsResponse);

        mockMvc.perform(get("/api/v1/receipts/1/details"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenId").value(1))
                .andExpect(jsonPath("$.invoiceNo").value("INV-001"));
    }

    @Test
    @WithMockUser
    void testGetReceiptsByOwner() throws Exception {
        ReceiptDetailsResponse receipt = new ReceiptDetailsResponse();
        receipt.setTokenId(1L);
        receipt.setInvoiceNo("INV-001");

        when(receiptService.getReceiptsByOwner(any())).thenReturn(Arrays.asList(receipt));

        mockMvc.perform(get("/api/v1/receipts/owner/0x1234567890123456789012345678901234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tokenId").value(1))
                .andExpect(jsonPath("$[0].invoiceNo").value("INV-001"));
    }
}
