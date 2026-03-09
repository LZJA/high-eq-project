package com.highiq.exception;

/**
 * 人物档案创建数量超限异常
 */
public class ProfileLimitExceededException extends RuntimeException {

    public ProfileLimitExceededException(String message) {
        super(message);
    }
}
