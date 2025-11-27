import { Router } from "express";
import prisma from "../libs/db.js";

const router = Router();

/**
 * 著者検索
 */
router.get("/author", async (req, res) => {
  const keyword = (req.query.keyword as string) || "";

  try {
    const authors = await prisma.author.findMany({
      where: { name: { contains: keyword },is_deleted: false },
      select: { id: true, name: true },
    });
    return res.status(200).json({ authors });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ authors: [] });
  }
});

/**
 * 出版社検索
 */
router.get("/publisher", async (req, res) => {
  const keyword = (req.query.keyword as string) || "";

    try {
      const publishers = await prisma.publisher.findMany({
        where: { name: { contains: keyword } ,is_deleted: false },
        select: { id: true, name: true },
      });
      return res.status(200).json({ publishers });
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({ publishers: [] });
    }
  }
);

export default router;
