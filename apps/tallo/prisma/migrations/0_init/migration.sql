-- CreateTable
CREATE TABLE `deposits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `external_id` VARCHAR(191) NOT NULL,
    `bank_account` VARCHAR(64) NULL,
    `payer_name` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `balance` INTEGER NULL,
    `tx_at` DATETIME(3) NOT NULL,
    `raw_text` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `deposits_external_id_key`(`external_id`),
    INDEX `deposits_tx_at_idx`(`tx_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(16) NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `last_used_at` DATETIME(3) NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `api_tokens_token_hash_key`(`token_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

