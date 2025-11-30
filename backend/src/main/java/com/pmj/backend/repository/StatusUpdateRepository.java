package com.pmj.backend.repository;

import com.pmj.backend.model.StatusUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StatusUpdateRepository extends JpaRepository<StatusUpdate, Long> {
    List<StatusUpdate> findByShipmentIdOrderByTimestampDesc(Long shipmentId);
}
