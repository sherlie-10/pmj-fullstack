package com.pmj.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final Key key;
    private final long jwtExpirationMs;
    private final long pendingExpirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long jwtExpirationMs,
            @Value("${jwt.pending-expiration-ms}") long pendingExpirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
        this.pendingExpirationMs = pendingExpirationMs;
    }

    /**
     * Generate a normal authentication token for the given subject (email/username).
     * This is the existing simple method you already used in the project.
     */
    public String generateToken(String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Overload: generate a token including useful claims for server-side lookup.
     * Subject is set to the uuid (or any stable identifier). Additional claims
     * include userId and role so the token carries more context.
     *
     * Use this from server code when you want the token to include role/uuid/userId.
     */
    public String generateToken(Long userId, String role, String uuid) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(uuid != null ? uuid : String.valueOf(userId))
                .claim("userId", userId)
                .claim("role", role)
                .claim("uuid", uuid)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate a short-lived "pending" token used for MFA verification flow.
     * Claim: "mfa-pending" = true
     */
    public String generatePendingToken(String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + pendingExpirationMs);
        return Jwts.builder()
                .setSubject(subject)
                .claim("mfa-pending", true)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Basic validity check: signature, expiry and structure.
     * By default this method will return false for invalid, expired or malformed tokens.
     *
     * If you want to treat pending tokens (MFA) as invalid for normal authentication,
     * use the overload validateTokenForAuth or check isPendingToken(token) separately.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    /**
     * Validate token and also ensure it is NOT an MFA pending token.
     * Useful for regular authentication endpoints (where pending tokens should be rejected).
     */
    public boolean validateTokenForAuth(String token) {
        try {
            Claims claims = parseClaims(token);
            Object pending = claims.get("mfa-pending");
            if (Boolean.TRUE.equals(pending)) {
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    /**
     * Returns true if token was created as an MFA pending token.
     */
    public boolean isPendingToken(String token) {
        try {
            Claims claims = parseClaims(token);
            Object v = claims.get("mfa-pending");
            return Boolean.TRUE.equals(v);
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    /**
     * Extract the subject (email/username) from the token.
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract any claim using a resolver function.
     */
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = parseClaims(token);
        return resolver.apply(claims);
    }

    /**
     * Get expiration date from token.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Check if token is expired.
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.before(new Date());
        } catch (JwtException | IllegalArgumentException ex) {
            // Consider invalid tokens as "expired"/not usable
            return true;
        }
    }

    /**
     * Parse claims (centralized parsing to validate signature & expiry).
     * This will throw JwtException on invalid tokens.
     */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
