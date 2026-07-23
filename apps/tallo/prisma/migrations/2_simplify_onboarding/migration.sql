-- AlterTable
ALTER TABLE `devices` DROP COLUMN `ingest_token_id`,
    ADD COLUMN `notification_confirmed_at` DATETIME(3) NULL;

-- DropTable
DROP TABLE `registration_sessions`;

