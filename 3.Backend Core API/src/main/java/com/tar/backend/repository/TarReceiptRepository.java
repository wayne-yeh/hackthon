package com.tar.backend.repository;

import com.tar.backend.entity.TarReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TAR receipt operations
 */
@Repository
public interface TarReceiptRepository extends JpaRepository<TarReceipt, Long> {

    Optional<TarReceipt> findByTokenId(Long tokenId);

    Optional<TarReceipt> findByInvoiceNo(String invoiceNo);

    List<TarReceipt> findByOwnerAddress(String ownerAddress);

    List<TarReceipt> findByOwnerAddressAndRevoked(String ownerAddress, Boolean revoked);

    @Query("SELECT t FROM TarReceipt t WHERE t.ownerAddress = :ownerAddress AND t.revoked = false")
    List<TarReceipt> findActiveReceiptsByOwner(@Param("ownerAddress") String ownerAddress);

    @Query("SELECT COUNT(t) FROM TarReceipt t WHERE t.revoked = false")
    long countActiveReceipts();

    @Query("SELECT COUNT(t) FROM TarReceipt t WHERE t.ownerAddress = :ownerAddress AND t.revoked = false")
    long countActiveReceiptsByOwner(@Param("ownerAddress") String ownerAddress);

    boolean existsByInvoiceNo(String invoiceNo);

    boolean existsByTokenId(Long tokenId);
}

