-- Converte IDs UUID existentes para IDs inteiros e preserva as relações das tarefas.
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_user_id_fkey`;
DROP INDEX `tasks_user_id_idx` ON `tasks`;

ALTER TABLE `usuarios`
  ADD COLUMN `id_new` INTEGER NOT NULL AUTO_INCREMENT UNIQUE;
ALTER TABLE `tasks` ADD COLUMN `user_id_new` INTEGER NULL;
UPDATE `tasks` AS t
  INNER JOIN `usuarios` AS u ON t.`user_id` = u.`id`
  SET t.`user_id_new` = u.`id_new`;

ALTER TABLE `usuarios` DROP PRIMARY KEY;
ALTER TABLE `usuarios` DROP COLUMN `id`;
ALTER TABLE `usuarios` CHANGE COLUMN `id_new` `id` INTEGER NOT NULL AUTO_INCREMENT;
ALTER TABLE `usuarios` ADD PRIMARY KEY (`id`);

ALTER TABLE `tasks` DROP COLUMN `user_id`;
ALTER TABLE `tasks` CHANGE COLUMN `user_id_new` `user_id` INTEGER NOT NULL;
CREATE INDEX `tasks_user_id_idx` ON `tasks` (`user_id`);
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
