-- CreateTable
CREATE TABLE `Author` (
    `id` VARCHAR(36) NOT NULL DEFAULT UUID_V7(),
    `name` VARCHAR(128) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Author_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Publisher` (
    `id` VARCHAR(36) NOT NULL DEFAULT UUID_V7(),
    `name` VARCHAR(128) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Publisher_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(36) NOT NULL DEFAULT UUID_V7(),
    `email` VARCHAR(254) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `password` VARCHAR(256) NOT NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT NOW(),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Book` (
    `isbn` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(512) NOT NULL,
    `author_id` VARCHAR(36) NOT NULL,
    `publisher_id` VARCHAR(36) NOT NULL,
    `publication_year` INTEGER UNSIGNED NOT NULL,
    `publication_month` TINYINT UNSIGNED NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`isbn`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentalLog` (
    `id` VARCHAR(36) NOT NULL DEFAULT UUID_V7(),
    `book_id` BIGINT UNSIGNED NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `checkout_date` DATETIME(3) NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `returned_date` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `Author`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_publisher_id_fkey` FOREIGN KEY (`publisher_id`) REFERENCES `Publisher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalLog` ADD CONSTRAINT `RentalLog_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `Book`(`isbn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalLog` ADD CONSTRAINT `RentalLog_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
