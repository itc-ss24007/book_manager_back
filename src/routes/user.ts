import { Router, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import argon2 from "argon2";
import prisma from "../libs/db.js"; // ここは自作の Prisma 接続
import passport from "passport";


interface RegisterBody {
  email: string;
  name: string;
  password: string;
}

const router = Router();

// router.get('/login',async(req,res)=>{
//   res.render('user/login', {
//     error: ('error')
//   })
// })

router.post("/login", (req, res, next) => {
  passport.authenticate("local",
    (err: Error | null,
     user: Express.User | false,
     info?: { message?: string }) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: info?.message || "認証失敗" });
    }

      req.login(user, (err) => {
        if (err) return next(err);

        // ★ ここを追加 — セッションを確実に保存してからレスポンス
        req.session.save(() => {
          return res.status(200).json({ message: "ok" });
        });
      });
    })(req, res, next);
});

// router.get('/register',(req,res)=>{
//   res.render('user/register')
// })

router.post(
  "/register",
  [
    check("email").notEmpty().isEmail(),
    check("name").notEmpty(),
    check("password").notEmpty()
  ],
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    // 入力バリデーション
    const result = validationResult(req);
    //console.log(errors);
    if (!result.isEmpty()) {
      return res.status(400).json({ reason: "パラメータが不正です" });
    }

    const { email, name, password } = req.body;

    // メールアドレス重複チェック
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ reason: "このメールアドレスは既に登録されています" });
    }

    // パスワードをハッシュ化
    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id,
      timeCost: 2,
      memoryCost: 19456 });

    // ユーザー作成
    const newUser= await prisma.user.create({
      data:{
        email:req.body.email,
        name:req.body.name,
        password:hashedPassword,
      }
    })

    // 成功 → HTTP 200、レスポンスは空
    return res.status(200).send();
  }
);

router.use(async (req, res, next) => {
  // ログイン中かどうかをチェックするミドルウェア
  if (!req.isAuthenticated()) {
    // 未ログインなので、ログインページにリダイレクト
    res.status(401).json({ message: "ログインが必要です" });
    return
  }
  next()
})

router.get("/history", async (req, res) => {
  const user = req.user as { id: string };
  try {
    const rentals = await prisma.rentalLog.findMany({
      where: {
        user_id: user.id, // ログインユーザー
      },
      include: {
        book: {
          select: {
            isbn: true,
            title: true,
          },
        },
      },
      orderBy: {
        checkout_date: "desc", // 新しい貸出順
      },
    });

    return res.status(200).json({
      history: rentals.map((r) => ({
        id: r.id,
        book: {
          isbn: Number(r.book.isbn),
          name: r.book.title,
        },
        checkout_date: r.checkout_date,
        due_date: r.due_date,
        returned_date: r.returned_date,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
})

// ユーザー名変更
router.put("/change",
  check("name").notEmpty(),
  async (req, res) => {

  const errors = validationResult(req);
  const { name } = req.body;

  // バリデーション
  if (!errors.isEmpty()) {
    return res.status(400).json({ reason: "名前は必須です" });
  }

  try {
    const user = req.user as { id: string ,name: string };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    // セッション内ユーザー情報更新（重要!!）
    user.name = updatedUser.name;

    return res.status(200).json({ message: "更新しました" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ reason: "更新に失敗しました" });
  }
});

export default router;
