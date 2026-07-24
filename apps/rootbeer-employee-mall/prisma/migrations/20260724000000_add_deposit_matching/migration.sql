-- 입금 자동정산: 주문에 매칭 입금 참조/정산시각 추가 (additive nullable, expand-safe)
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `matched_deposit_id` VARCHAR(191) NULL,
    ADD COLUMN `settled_at` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `orders_matched_deposit_id_idx` ON `orders`(`matched_deposit_id`);
