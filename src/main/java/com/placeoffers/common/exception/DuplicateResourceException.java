package com.placeoffers.common.exception;

public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String field, String value) {
        super("Já existe um registro com " + field + ": " + value);
    }
}
