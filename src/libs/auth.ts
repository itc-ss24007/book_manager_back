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

        console.log(user.password);
        console.log(password);

        const valid = await argon2.verify(user.password, password);
        console.log(valid);
        if (!valid) return done(null, false, { message: "パスワードが間違っています" });

        return done(null, user); // 登录成功
      } catch (err) {
        return done(err);
      }
    }
  )
);

// 序列化用户信息到 session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 从 session 取回用户信息
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
