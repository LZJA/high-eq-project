package com.highiq.service;

import java.util.List;

public record ContinueChatGeneration(String opponentSummary, List<String> suggestions) {
}
