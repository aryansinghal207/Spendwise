package com.spendwise.SpendWise.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
@ConditionalOnProperty(prefix = "keepalive", name = "enabled", havingValue = "true", matchIfMissing = true)
public class KeepAliveScheduler {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveScheduler.class);

    private final JdbcTemplate jdbcTemplate;
    private final String validationQuery;

    public KeepAliveScheduler(
            JdbcTemplate jdbcTemplate,
            @Value("${keepalive.validation-query:SELECT 1}") String validationQuery
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.validationQuery = validationQuery;
    }

    /**
     * Runs every 5 minutes.
     * Cron format: second minute hour day-of-month month day-of-week
     */
    @Scheduled(cron = "${keepalive.cron:0 */5 * * * *}")
    public void keepAlive() {
        Instant start = Instant.now();
        boolean dbUp = false;
        String error = null;

        try {
            jdbcTemplate.queryForObject(validationQuery, Integer.class);
            dbUp = true;
        } catch (Exception ex) {
            error = ex.getClass().getSimpleName() + ": " + (ex.getMessage() == null ? "" : ex.getMessage());
        }

        long ms = Duration.between(start, Instant.now()).toMillis();
        if (dbUp) {
            log.info("KeepAlive executed in {}ms | status=UP | db=UP", ms);
        } else {
            log.warn("KeepAlive executed in {}ms | status=DEGRADED | db=DOWN | error={}", ms, error);
        }
    }
}

