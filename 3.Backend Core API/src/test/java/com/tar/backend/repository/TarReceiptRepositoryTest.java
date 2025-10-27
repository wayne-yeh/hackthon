package com.tar.backend.repository;

import com.tar.backend.entity.TarReceipt;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test for TarReceiptRepository
 */
@DataJpaTest
@ActiveProfiles("test")
class TarReceiptRepositoryTest {

    @Autowired
    private TarReceiptRepository repository;

    private TarReceipt testReceipt;

    @BeforeEach
    void setUp() {
        repository.deleteAll();

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

        repository.save(testReceipt);
    }

    @Test
    void testFindByTokenId() {
        Optional<TarReceipt> found = repository.findByTokenId(1L);
        assertTrue(found.isPresent());
        assertEquals("INV-001", found.get().getInvoiceNo());
    }

    @Test
    void testFindByTokenId_NotFound() {
        Optional<TarReceipt> found = repository.findByTokenId(999L);
        assertFalse(found.isPresent());
    }

    @Test
    void testFindByInvoiceNo() {
        Optional<TarReceipt> found = repository.findByInvoiceNo("INV-001");
        assertTrue(found.isPresent());
        assertEquals(1L, found.get().getTokenId());
    }

    @Test
    void testFindByOwnerAddress() {
        List<TarReceipt> receipts = repository.findByOwnerAddress(
                "0x1234567890123456789012345678901234567890");
        assertEquals(1, receipts.size());
        assertEquals("INV-001", receipts.get(0).getInvoiceNo());
    }

    @Test
    void testFindActiveReceiptsByOwner() {
        List<TarReceipt> receipts = repository.findActiveReceiptsByOwner(
                "0x1234567890123456789012345678901234567890");
        assertEquals(1, receipts.size());
        assertFalse(receipts.get(0).getRevoked());
    }

    @Test
    void testFindActiveReceiptsByOwner_WithRevokedReceipts() {
        testReceipt.setRevoked(true);
        repository.save(testReceipt);

        List<TarReceipt> receipts = repository.findActiveReceiptsByOwner(
                "0x1234567890123456789012345678901234567890");
        assertEquals(0, receipts.size());
    }

    @Test
    void testCountActiveReceipts() {
        long count = repository.countActiveReceipts();
        assertEquals(1, count);

        testReceipt.setRevoked(true);
        repository.save(testReceipt);

        count = repository.countActiveReceipts();
        assertEquals(0, count);
    }

    @Test
    void testCountActiveReceiptsByOwner() {
        long count = repository.countActiveReceiptsByOwner(
                "0x1234567890123456789012345678901234567890");
        assertEquals(1, count);
    }

    @Test
    void testExistsByInvoiceNo() {
        assertTrue(repository.existsByInvoiceNo("INV-001"));
        assertFalse(repository.existsByInvoiceNo("INV-999"));
    }

    @Test
    void testExistsByTokenId() {
        assertTrue(repository.existsByTokenId(1L));
        assertFalse(repository.existsByTokenId(999L));
    }
}

