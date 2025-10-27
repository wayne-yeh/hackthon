package com.tar.backend.integration;

import com.tar.backend.entity.TarReceipt;
import com.tar.backend.repository.TarReceiptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test for TAR receipt system
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TarReceiptIntegrationTest {

    @Autowired
    private TarReceiptRepository receiptRepository;

    @BeforeEach
    void setUp() {
        receiptRepository.deleteAll();
    }

    @Test
    void testFullReceiptLifecycle() {
        // Create receipt
        TarReceipt receipt = new TarReceipt(
                1L,
                "INV-INTEGRATION-001",
                LocalDate.now(),
                new BigDecimal("1500.00"),
                "Integration Test Item",
                "0x1111111111111111111111111111111111111111",
                "https://metadata.example.com/int1",
                "0x1111111111111111111111111111111111111111111111111111111111111111",
                "0x2222222222222222222222222222222222222222222222222222222222222222");

        // Save receipt
        TarReceipt savedReceipt = receiptRepository.save(receipt);
        assertNotNull(savedReceipt.getId());
        assertNotNull(savedReceipt.getCreatedAt());
        assertFalse(savedReceipt.getRevoked());

        // Retrieve receipt
        TarReceipt foundReceipt = receiptRepository.findByTokenId(1L).orElseThrow();
        assertEquals("INV-INTEGRATION-001", foundReceipt.getInvoiceNo());
        assertEquals(new BigDecimal("1500.00"), foundReceipt.getAmount());

        // Revoke receipt
        foundReceipt.setRevoked(true);
        TarReceipt revokedReceipt = receiptRepository.save(foundReceipt);
        assertTrue(revokedReceipt.getRevoked());

        // Verify revoked receipt is not in active list
        long activeCount = receiptRepository.countActiveReceiptsByOwner(
                "0x1111111111111111111111111111111111111111");
        assertEquals(0, activeCount);
    }

    @Test
    void testMultipleReceiptsForSameOwner() {
        // Create multiple receipts
        for (int i = 1; i <= 3; i++) {
            TarReceipt receipt = new TarReceipt(
                    (long) i,
                    "INV-MULTI-00" + i,
                    LocalDate.now(),
                    new BigDecimal("100.00").multiply(new BigDecimal(i)),
                    "Item " + i,
                    "0x3333333333333333333333333333333333333333",
                    "https://metadata.example.com/" + i,
                    "0x" + String.format("%064d", i),
                    "0x" + String.format("%064d", i + 1000));
            receiptRepository.save(receipt);
        }

        // Verify count
        long count = receiptRepository.countActiveReceiptsByOwner(
                "0x3333333333333333333333333333333333333333");
        assertEquals(3, count);

        // Retrieve all receipts for owner
        var receipts = receiptRepository.findByOwnerAddress(
                "0x3333333333333333333333333333333333333333");
        assertEquals(3, receipts.size());
    }
}

