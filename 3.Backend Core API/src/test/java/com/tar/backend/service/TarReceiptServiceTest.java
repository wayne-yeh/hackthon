package com.tar.backend.service;

import com.tar.backend.dto.*;
import com.tar.backend.entity.TarReceipt;
import com.tar.backend.repository.TarReceiptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test for TarReceiptService
 */
@ExtendWith(MockitoExtension.class)
class TarReceiptServiceTest {

    @Mock
    private TarReceiptRepository receiptRepository;

    @Mock
    private BlockchainService blockchainService;

    @Mock
    private MetadataServiceClient metadataServiceClient;

    @InjectMocks
    private TarReceiptService receiptService;

    private IssueReceiptRequest issueRequest;
    private TarReceipt testReceipt;

    @BeforeEach
    void setUp() {
        issueRequest = new IssueReceiptRequest(
                "INV-001",
                LocalDate.of(2024, 1, 1),
                new BigDecimal("1000.00"),
                "Test Item",
                "0x1234567890123456789012345678901234567890",
                null);

        testReceipt = new TarReceipt(
                1L,
                "INV-001",
                LocalDate.of(2024, 1, 1),
                new BigDecimal("1000.00"),
                "Test Item",
                "0x1234567890123456789012345678901234567890",
                "https://metadata.example.com/1",
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
                "0x9876543210987654321098765432109876543210987654321098765432109876");
    }

    @Test
    void testIssueReceipt_Success() {
        when(receiptRepository.existsByInvoiceNo("INV-001")).thenReturn(false);

        MetadataServiceClient.MetadataUploadResult metadataResult = new MetadataServiceClient.MetadataUploadResult(
                "https://metadata.example.com/1",
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");
        when(metadataServiceClient.uploadMetadata(any(), any(), any(), any(), any(), any()))
                .thenReturn(metadataResult);

        BlockchainService.MintResult mintResult = new BlockchainService.MintResult(
                1L,
                "0x9876543210987654321098765432109876543210987654321098765432109876",
                true);
        when(blockchainService.mintReceipt(any(), any(), any())).thenReturn(mintResult);

        when(receiptRepository.save(any(TarReceipt.class))).thenReturn(testReceipt);

        IssueReceiptResponse response = receiptService.issueReceipt(issueRequest);

        assertTrue(response.isSuccess());
        assertEquals(1L, response.getTokenId());
        assertEquals("Receipt issued successfully", response.getMessage());

        verify(receiptRepository).existsByInvoiceNo("INV-001");
        verify(metadataServiceClient).uploadMetadata(any(), any(), any(), any(), any(), any());
        verify(blockchainService).mintReceipt(any(), any(), any());
        verify(receiptRepository).save(any(TarReceipt.class));
    }

    @Test
    void testIssueReceipt_DuplicateInvoice() {
        when(receiptRepository.existsByInvoiceNo("INV-001")).thenReturn(true);

        IssueReceiptResponse response = receiptService.issueReceipt(issueRequest);

        assertFalse(response.isSuccess());
        assertEquals("Invoice number already exists", response.getMessage());

        verify(receiptRepository).existsByInvoiceNo("INV-001");
        verify(metadataServiceClient, never()).uploadMetadata(any(), any(), any(), any(), any(), any());
        verify(blockchainService, never()).mintReceipt(any(), any(), any());
    }

    @Test
    void testVerifyReceipt_Valid() {
        VerifyReceiptRequest verifyRequest = new VerifyReceiptRequest(
                1L,
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");

        when(receiptRepository.findByTokenId(1L)).thenReturn(Optional.of(testReceipt));
        when(blockchainService.verifyReceipt(1L,
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"))
                .thenReturn(true);

        VerifyReceiptResponse response = receiptService.verifyReceipt(verifyRequest);

        assertTrue(response.isValid());
        assertFalse(response.isRevoked());
        assertEquals("Receipt is valid", response.getMessage());

        verify(receiptRepository).findByTokenId(1L);
        verify(blockchainService).verifyReceipt(any(), any());
    }

    @Test
    void testVerifyReceipt_NotFound() {
        VerifyReceiptRequest verifyRequest = new VerifyReceiptRequest(999L, "0xabcdef");

        when(receiptRepository.findByTokenId(999L)).thenReturn(Optional.empty());

        VerifyReceiptResponse response = receiptService.verifyReceipt(verifyRequest);

        assertFalse(response.isValid());
        assertEquals("Receipt not found", response.getMessage());

        verify(receiptRepository).findByTokenId(999L);
        verify(blockchainService, never()).verifyReceipt(any(), any());
    }

    @Test
    void testVerifyReceipt_Revoked() {
        testReceipt.setRevoked(true);
        VerifyReceiptRequest verifyRequest = new VerifyReceiptRequest(1L, "0xabcdef");

        when(receiptRepository.findByTokenId(1L)).thenReturn(Optional.of(testReceipt));

        VerifyReceiptResponse response = receiptService.verifyReceipt(verifyRequest);

        assertFalse(response.isValid());
        assertTrue(response.isRevoked());
        assertEquals("Receipt has been revoked", response.getMessage());

        verify(receiptRepository).findByTokenId(1L);
        verify(blockchainService, never()).verifyReceipt(any(), any());
    }

    @Test
    void testRevokeReceipt_Success() {
        when(receiptRepository.findByTokenId(1L)).thenReturn(Optional.of(testReceipt));

        BlockchainService.RevokeResult revokeResult = new BlockchainService.RevokeResult(
                "0x1234567890",
                true);
        when(blockchainService.revokeReceipt(1L)).thenReturn(revokeResult);

        when(receiptRepository.save(any(TarReceipt.class))).thenReturn(testReceipt);

        receiptService.revokeReceipt(1L);

        verify(receiptRepository).findByTokenId(1L);
        verify(blockchainService).revokeReceipt(1L);
        verify(receiptRepository).save(any(TarReceipt.class));
    }

    @Test
    void testRevokeReceipt_NotFound() {
        when(receiptRepository.findByTokenId(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> receiptService.revokeReceipt(999L));

        verify(receiptRepository).findByTokenId(999L);
        verify(blockchainService, never()).revokeReceipt(any());
    }

    @Test
    void testRevokeReceipt_AlreadyRevoked() {
        testReceipt.setRevoked(true);
        when(receiptRepository.findByTokenId(1L)).thenReturn(Optional.of(testReceipt));

        assertThrows(RuntimeException.class, () -> receiptService.revokeReceipt(1L));

        verify(receiptRepository).findByTokenId(1L);
        verify(blockchainService, never()).revokeReceipt(any());
    }

    @Test
    void testGetReceiptDetails() {
        when(receiptRepository.findByTokenId(1L)).thenReturn(Optional.of(testReceipt));

        ReceiptDetailsResponse response = receiptService.getReceiptDetails(1L);

        assertEquals(1L, response.getTokenId());
        assertEquals("INV-001", response.getInvoiceNo());
        assertEquals("Test Item", response.getItemName());

        verify(receiptRepository).findByTokenId(1L);
    }

    @Test
    void testGetReceiptsByOwner() {
        when(receiptRepository.findByOwnerAddress(any()))
                .thenReturn(Arrays.asList(testReceipt));

        List<ReceiptDetailsResponse> receipts = receiptService.getReceiptsByOwner(
                "0x1234567890123456789012345678901234567890");

        assertEquals(1, receipts.size());
        assertEquals("INV-001", receipts.get(0).getInvoiceNo());

        verify(receiptRepository).findByOwnerAddress(any());
    }

    @Test
    void testGetActiveReceiptsByOwner() {
        when(receiptRepository.findActiveReceiptsByOwner(any()))
                .thenReturn(Arrays.asList(testReceipt));

        List<ReceiptDetailsResponse> receipts = receiptService.getActiveReceiptsByOwner(
                "0x1234567890123456789012345678901234567890");

        assertEquals(1, receipts.size());
        assertFalse(receipts.get(0).isRevoked());

        verify(receiptRepository).findActiveReceiptsByOwner(any());
    }
}

