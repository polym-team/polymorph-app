-- oauth-server 통합(Strategy A): users 에 링크 컬럼 추가 (비파괴적, nullable).
-- orders.user_id(Int PK 앵커)는 변경하지 않는다. 기존/신규 코드 공존 가능.
ALTER TABLE `users`
  ADD COLUMN `oauth_user_id` VARCHAR(64) NULL,
  ADD COLUMN `cautions_agreed_at` DATETIME(3) NULL;

CREATE UNIQUE INDEX `users_oauth_user_id_key` ON `users`(`oauth_user_id`);
