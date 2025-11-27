import {ensureAdmin} from "../libs/middleware.js";
import {Router, Request, Response} from "express";
import prisma from "../libs/db.js";
import { body, validationResult } from "express-validator";

const router=Router();

/**
 * 著者登録
 */
router.post(
  "/author",
  ensureAdmin,
  body("name").notEmpty().withMessage("著者名は必須です"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "著者名は必須です" });
    }

    try {
      const { name } = req.body;
      const author = await prisma.author.create({
        data: { name },
      });

      return res.status(200).json(author);
    } catch (err) {
      return res.status(400).json({ message: "登録に失敗しました" });
    }
  }
);

//著者更新
router.put(
  "/author",
  ensureAdmin,
  body("id").notEmpty(),
  body("name").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "ID / 著者名は必須です" });
    }

    try {
      const { id, name } = req.body;
      const author = await prisma.author.update({
        where: { id },
        data: { name },
      });

      return res.status(200).json(author);
    } catch (err) {
      return res.status(400).json({ message: "更新に失敗しました" });
    }
  }
);

/**
 * 著者削除
 */
router.delete(
  "/author",
  ensureAdmin,
  body("id").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "IDは必須です" });
    }

    try {
      const { id } = req.body;
      await prisma.author.update({
        where: { id },
        data: { is_deleted: true },
      });
      return res.status(200).json({ message: "削除しました" });
    } catch (err:any) {
      return res.status(400).json({ message: err.message ||"削除に失敗しました" });
    }
  }
);

/**
 * 出版社登録
 */
router.post(
  "/publisher",
  ensureAdmin,
  body("name").notEmpty().withMessage("出版社名は必須です"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "出版社名は必須です" });
    }

    try {
      const { name } = req.body;
      const publisher = await prisma.publisher.create({ data: { name } });
      return res.status(200).json(publisher);
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ message: err.message || "登録に失敗しました" });
    }
  }
);

/**
 * 出版社更新
 */
router.put(
  "/publisher",
  ensureAdmin,
  body("id").notEmpty(),
  body("name").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "ID / 出版社名は必須です" });
    }

    try {
      const { id, name } = req.body;
      const publisher = await prisma.publisher.update({
        where: { id },
        data: { name },
      });
      return res.status(200).json(publisher);
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ message: err.message || "更新に失敗しました" });
    }
  }
);

/**
 * 出版社削除
 */
router.delete(
  "/publisher",
  ensureAdmin,
  body("id").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "IDは必須です" });
    }

    try {
      const { id } = req.body;
      await prisma.publisher.update({ where: { id }, data: { is_deleted: true } });

      return res.status(200).json({ message: "削除しました" });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "削除に失敗しました" });
    }
  }
);

/**
 * 書籍登録
 */
router.post(
  "/book",
  ensureAdmin,
  body("isbn").notEmpty(),
  body("title").notEmpty(),
  body("author_id").notEmpty(),
  body("publisher_id").notEmpty(),
  body("publication_year").isInt(),
  body("publication_month").isInt({ min: 1, max: 12 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "必須項目が不足しています" });

    const { isbn, title, author_id, publisher_id, publication_year, publication_month } = req.body;

    try {
      const exist = await prisma.book.findUnique({ where: { isbn: BigInt(isbn) } });
      if (exist) return res.status(400).json({ message: "この ISBN の書籍は既に存在します" });

      await prisma.book.create({
        data: { isbn: BigInt(isbn), title, author_id, publisher_id, publication_year, publication_month }
      });

      return res.status(200).json({ message: "登録しました" });
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ message: err.message || "登録に失敗しました" });
    }
  }
);

/**
 * 書籍更新
 */
router.put(
  "/book",
  ensureAdmin,
  body("isbn").notEmpty(),
  body("title").notEmpty(),
  body("author_id").notEmpty(),
  body("publisher_id").notEmpty(),
  body("publication_year").isInt(),
  body("publication_month").isInt({ min: 1, max: 12 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "必須項目が不足しています" });

    const { isbn, title, author_id, publisher_id, publication_year, publication_month } = req.body;

    try {
      const book = await prisma.book.findUnique({ where: { isbn: BigInt(isbn) } });
      if (!book) return res.status(400).json({ message: "存在しない ISBN です" });

      await prisma.book.update({
        where: { isbn: BigInt(isbn) },
        data: { title, author_id, publisher_id, publication_year, publication_month }
      });

      return res.status(200).json({ message: "更新しました" });
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ message: err.message || "更新に失敗しました" });
    }
  }
);

/**
 * 書籍削除（論理削除）
 */
router.delete(
  "/book",
  ensureAdmin,
  body("isbn").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "ISBNは必須です" });

    const { isbn } = req.body;

    try {
      const book = await prisma.book.findUnique({ where: { isbn: BigInt(isbn) } });
      if (!book) return res.status(400).json({ message: "存在しない ISBN です" });

      // 論理削除
      await prisma.book.update({
        where: { isbn: BigInt(isbn) },
        data: { is_deleted: true }
      });

      return res.status(200).json({ message: "削除しました" });
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ message: err.message || "削除に失敗しました" });
    }
  }
);


export default router;
