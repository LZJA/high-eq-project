package com.highiq.util;

import jakarta.servlet.http.HttpServletRequest;

public final class GuestClientKeyUtil {
    private GuestClientKeyUtil() {
    }

    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        ip = ip != null ? ip.split(",")[0].trim() : "unknown";
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            return "127.0.0.1";
        }
        return ip;
    }

    public static String getClientKey(HttpServletRequest request) {
        return getClientIp(request) + ":" + getGuestId(request);
    }

    private static String getGuestId(HttpServletRequest request) {
        String guestId = request.getHeader("X-Guest-Id");
        if (guestId == null || guestId.isBlank()) {
            guestId = "anonymous";
        }
        guestId = guestId.replaceAll("[^a-zA-Z0-9_-]", "");
        if (guestId.length() > 64) {
            return guestId.substring(0, 64);
        }
        return guestId;
    }
}
