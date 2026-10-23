package com.sevadeep.sevaconnect.repository;

import com.sevadeep.sevaconnect.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    @Query("select count(r) from Registration r where r.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);

    @Query("select count(r) > 0 from Registration r where r.event.id = :eventId and r.user.id = :userId")
    boolean existsByEventIdAndUserId(@Param("eventId") Long eventId, @Param("userId") Long userId);

    @Query("select r from Registration r where r.event.id = :eventId and r.user.id = :userId")
    Optional<Registration> findByEventIdAndUserId(@Param("eventId") Long eventId, @Param("userId") Long userId);

    @Query("select r from Registration r where r.event.id = :eventId")
    List<Registration> findByEventId(@Param("eventId") Long eventId);

    @Query("select r from Registration r where r.user.id = :userId order by r.event.eventDate desc")
    List<Registration> findByUserId(@Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query("delete from Registration r where r.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);
}
