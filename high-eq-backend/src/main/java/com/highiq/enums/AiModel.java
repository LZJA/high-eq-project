package com.highiq.enums;

import lombok.Getter;

@Getter
public enum AiModel {
    DEEPSEEK_V4_FLASH("deepseek-v4-flash", 1, false),
    DEEPSEEK_V4_PRO("deepseek-v4-pro", 3, false),
    QWEN3_VL_PLUS("qwen3-vl-plus", 3, true),
    DOUBAO_SEED_2_PRO("doubao-seed-2.0-pro", 8, true);

    public static final String DEFAULT_MODEL = "deepseek-v4-flash";

    private final String id;
    private final int pointCost;
    private final boolean supportsImage;

    AiModel(String id, int pointCost, boolean supportsImage) {
        this.id = id;
        this.pointCost = pointCost;
        this.supportsImage = supportsImage;
    }

    public static AiModel fromId(String modelId) {
        if (modelId == null || modelId.isBlank()) {
            return DEEPSEEK_V4_FLASH;
        }
        for (AiModel model : values()) {
            if (model.id.equalsIgnoreCase(modelId)) {
                return model;
            }
        }
        return DEEPSEEK_V4_FLASH;
    }

    public static int pointCostOf(String modelId) {
        return fromId(modelId).pointCost;
    }
}
