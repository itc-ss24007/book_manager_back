import {Router} from "express";
import prisma from "../libs/db.js"
import { body, validationResult } from "express-validator";


const router=Router();

router.use(async (req, res, next) => {
  // ログイン中かどうかをチェックするミドルウェア
  // console.log("Authenticated:", req.isAuthenticated());
  // console.log("SessionID:", req.sessionID);
  // console.log("User:", req.user);
  if (!req.isAuthenticated()) {
    // 未ログインなので、ログインページにリダイレクト
    res.status(401).json({ message: "ログインが必要です" });
    return
  }
  next()
})

// GET /book/list/1  書籍一覧取得（ページネーション対応）
router.get('/list/{:page}',async (req,res)=>{
  try{
    // パスパラメータからページ番号を取得、未指定の場合は1ページ目
    const page = parseInt(req.params.page || "1",10);
    const pageSize = 5;// 1ページあたり5件
    // スキップする件数を計算
    const skip = (page - 1) * pageSize;
    // 総件数を取得（最後のページ計算用）
    const total = await prisma.book.count({
      where: {is_deleted: false},
    });
    // 最終ページ番号を計算
    const last_page = Math.ceil(total / pageSize);
    // 書籍を取得、出版年・月の降順で並べ替え、著者情報も取得
    const books = await prisma.book.findMany({
      take:pageSize,// 取得件数
      skip:skip,// スキップ件数
      where:{
        is_deleted:false
      },
      orderBy:[
        {publication_year:"desc"},// 出版年降順
        {publication_month:"desc"},// 出版月降順
      ],
      include:{//join
        author:true,//関連の著者情報を取得
      }
    });
    // 出版年月を "YYYY-MM" 形式に整形
    const result = books.map((b) => ({
      isbn: Number(b.isbn),
      title: b.title,
      author: {
        name: b.author.name,
      },
      publication_year_month: `${b.publication_year}-${String(b.publication_month).padStart(2, "0")}`,
    }));
    // レスポンス返却
    res.status(200).json({
      current: page,  // 現在ページ
      last_page,      // 最終ページ
      books: result,  // 書籍一覧
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // エラー処理
  }
});

// 書籍詳細
router.get("/detail/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  const book = await prisma.book.findUnique({
    where: { isbn: BigInt(isbn) }, // ISBN が DB に BigInt の場合
    include: {
      author: true,
      publisher: true,
    },
  });

  if (!book) {
    return res.status(404).json({ message: "書籍が見つかりません" });
  }

  return res.status(200).json({
    isbn: Number(book.isbn), // BigInt → number 変換
    title: book.title,
    author: {
      name: book.author.name,
    },
    publisher: {
      name: book.publisher.name,
    },
    publication_year_month: `${book.publication_year}-${book.publication_month}`,
  });
});

// 書籍貸出
router.post(
  "/rental",
  // バリデーション
  body("book_id")
    .notEmpty().withMessage("書籍IDは必須です")
    .isNumeric().withMessage("書籍IDは数字である必要があります"),
  async (req, res) => {
    // バリデーション結果チェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { book_id } = req.body;

    try {
      // 1. 書籍存在チェック
      const book = await prisma.book.findUnique({
        where: { isbn: BigInt(book_id) },
      });
      if (!book || book.is_deleted) {
        return res.status(404).json({ message: "書籍が存在しません" });
      }

      // 2. 既に貸出中かチェック
      const ongoingRental = await prisma.rentalLog.findFirst({
        where: {
          book_isbn: book_id,
          returned_date: null, // 返却されていない
        },
      });

      if (ongoingRental) {
        return res.status(409).json({ message: "既に貸出中です" });
      }

      // 3. 貸出登録
      const now = new Date();
      const due = new Date();
      due.setDate(now.getDate() + 7); // 7日後

      const user = req.user as { id: string };

      const rental = await prisma.rentalLog.create({
        data: {
          book_isbn: book.isbn,
          user_id: user.id, // passport でログインユーザー
          checkout_date: now,
          due_date: due,
        },
      });

      res.status(200).json({
        id: rental.id,
        checkout_date: rental.checkout_date,
        due_date: rental.due_date,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "サーバーエラー" });
    }
  }
);

export default router;