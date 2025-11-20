import { Router, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import argon2 from "argon2";
import prisma from "../libs/db.js"; // ここは自作の Prisma 接続

interface RegisterBody {
  email: string;
  name: string;
  password: string;
}

const router = Router();

router.get('/login',async(req,res)=>{
  res.render('user/login', {
    error: ('error')
  })
})

router.get('/register',(req,res)=>{
  res.render('user/register')
})

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

export default router;
