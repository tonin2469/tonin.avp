CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `users_email_key` (`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tasks` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('pendente', 'em_andamento', 'concluida') NOT NULL DEFAULT 'pendente',
  `due_date` DATE NULL,
  `user_id` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `tasks_user_id_idx` (`user_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `tasks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
