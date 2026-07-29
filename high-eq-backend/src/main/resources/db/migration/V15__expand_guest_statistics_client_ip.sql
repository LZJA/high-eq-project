ALTER TABLE guest_statistics
  MODIFY COLUMN client_ip VARCHAR(128) NOT NULL COMMENT 'Client IP or guest client key';
