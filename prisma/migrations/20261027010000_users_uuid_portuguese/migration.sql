-- Preserva os usuários e tarefas já existentes ao migrar o id inteiro para UUID.
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_user_id_fkey`;
DROP INDEX `tasks_user_id_idx` ON `tasks`;

ALTER TABLE `users` ADD COLUMN `id_uuid` VARCHAR(36) NULL;
UPDATE `users` SET `id_uuid` = UUID() WHERE `id_uuid` IS NULL;
ALTER TABLE `tasks` ADD COLUMN `user_id_uuid` VARCHAR(36) NULL;
UPDATE `tasks` AS t
  INNER JOIN `users` AS u ON t.`user_id` = u.`id`
  SET t.`user_id_uuid` = u.`id_uuid`;

ALTER TABLE `users` MODIFY COLUMN `id` INTEGER NOT NULL;
ALTER TABLE `users` DROP PRIMARY KEY;
ALTER TABLE `users` DROP COLUMN `id`;
ALTER TABLE `users` CHANGE COLUMN `id_uuid` `id` VARCHAR(36) NOT NULL;
ALTER TABLE `users` CHANGE COLUMN `name` `nome` VARCHAR(100) NOT NULL;
ALTER TABLE `users` CHANGE COLUMN `email` `email` VARCHAR(191) NOT NULL;
ALTER TABLE `users` CHANGE COLUMN `password_hash` `senhaHash` VARCHAR(255) NOT NULL;
ALTER TABLE `users` CHANGE COLUMN `created_at` `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `users` CHANGE COLUMN `updated_at` `updated` DATETIME(3) NOT NULL;
ALTER TABLE `users` ADD PRIMARY KEY (`id`);
ALTER TABLE `users` RENAME TO `usuarios`;

ALTER TABLE `tasks` DROP COLUMN `user_id`;
ALTER TABLE `tasks` CHANGE COLUMN `user_id_uuid` `user_id` VARCHAR(36) NOT NULL;
CREATE INDEX `tasks_user_id_idx` ON `tasks` (`user_id`);
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
