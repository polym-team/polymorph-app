-- CreateTable
CREATE TABLE `devices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone_number` VARCHAR(32) NULL,
    `platform` VARCHAR(16) NOT NULL DEFAULT 'android',
    `ingest_token_id` INTEGER NULL,
    `last_seen_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `devices_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registration_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `device_id` INTEGER NOT NULL,
    `bank` VARCHAR(32) NOT NULL,
    `account_key` VARCHAR(191) NULL,
    `phone_number` VARCHAR(32) NOT NULL,
    `status` VARCHAR(24) NOT NULL,
    `otp_code` VARCHAR(16) NULL,
    `otp_received_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `registration_sessions_phone_number_status_idx`(`phone_number`, `status`),
    INDEX `registration_sessions_device_id_idx`(`device_id`),
    INDEX `registration_sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

