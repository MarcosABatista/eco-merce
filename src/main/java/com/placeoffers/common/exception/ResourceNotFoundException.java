package com.placeoffers.common.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " não encontrado com id: " + id);
    }
}
