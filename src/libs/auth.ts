import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "./db.js";
import argon2 from "argon2";


passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // 表单里的 email
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false, { message: "メールアドレスが存在しません" });
        if (user.is_deleted) return done(null, false, { message: "ユーザーが削除されています" });

        //console.log(user.password);
        //console.log(password);

        const valid = await argon2.verify(user.password, password);
        console.log(valid);
        if (!valid) return done(null, false, { message: "パスワードが間違っています" });

        return done(null, {id: user.id, name: user.name}); // 登录成功
      } catch (err) {
        return done(err);
      }
    }
  )
);

// セッションストレージにユーザー情報を保存する際の処理
passport.serializeUser((user: any, done) => {
  done(null, user.id); // IDのみを保存
});

// セッションストレージから serializeUser 関数によって保存されたユーザー情報を
// 取ってきた直後になにかする設定
passport.deserializeUser(async (id: string, done) => {
  try {
    // DB から ID を使ってユーザー情報を再取得
    const user = await prisma.user.findUnique({ where: { id } });
    // 見つかったユーザーオブジェクトを req.user に設定
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
