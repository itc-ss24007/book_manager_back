/*
  Warnings:

  - You are about to drop the column `book_id` on the `RentalLog` table. All the data in the column will be lost.
  - Added the required column `book_isbn` to the `RentalLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `RentalLog` DROP FOREIGN KEY `RentalLog_book_id_fkey`;

-- DropIndex
DROP INDEX `RentalLog_book_id_fkey` ON `RentalLog`;

-- AlterTable
ALTER TABLE `Author` MODIFY `id` VARCHAR(36) NOT NULL DEFAULT UUID_V7();

-- AlterTable
ALTER TABLE `Publisher` MODIFY `id` VARCHAR(36) NOT NULL DEFAULT UUID_V7();

-- AlterTable
ALTER TABLE `RentalLog` DROP COLUMN `book_id`,
    ADD COLUMN `book_isbn` BIGINT UNSIGNED NOT NULL,
    MODIFY `id` VARCHAR(36) NOT NULL DEFAULT UUID_V7();

-- AlterTable
ALTER TABLE `User` MODIFY `id` VARCHAR(36) NOT NULL DEFAULT UUID_V7(),
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT NOW();

-- AddForeignKey
ALTER TABLE `RentalLog` ADD CONSTRAINT `RentalLog_book_isbn_fkey` FOREIGN KEY (`book_isbn`) REFERENCES `Book`(`isbn`) ON DELETE RESTRICT ON UPDATE CASCADE;
