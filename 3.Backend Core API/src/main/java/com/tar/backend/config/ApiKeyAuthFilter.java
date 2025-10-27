package com.tar.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filter for API key authentication
 */
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final String apiKeyHeader;
    private final String apiKeySecret;

    public ApiKeyAuthFilter(String apiKeyHeader, String apiKeySecret) {
        this.apiKeyHeader = apiKeyHeader;
        this.apiKeySecret = apiKeySecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Skip authentication for public endpoints
        if (isPublicEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader(apiKeyHeader);

        if (apiKey != null && apiKey.equals(apiKeySecret)) {
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken("api-user",
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_API")));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.equals("/swagger-ui.html") ||
                path.startsWith("/actuator/health") ||
                path.contains("/verify") ||
                path.contains("/details");
    }
}

