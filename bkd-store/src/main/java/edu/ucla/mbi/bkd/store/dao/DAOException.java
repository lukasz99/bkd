package edu.ucla.mbi.bkd.store.dao;

public class DAOException extends RuntimeException {

    public DAOException(Throwable cause) {
        super(cause);
    }

    public DAOException(String message) {
        super(message);
    }
}
