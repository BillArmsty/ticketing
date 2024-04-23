import e, { Request, Response, Router, Application } from "express";
import { check } from "express-validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = Router();

router.post(
  "/signup",
  [
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body;
      console.log(req.body);
      
      const prisma = new PrismaClient();

      //find if user already exists
      const userExists = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      // create user in db and crypt password
      let password_hash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: password_hash,
          role,
          
        },
      });
      res.status(200).json({
        success: true,
        data: user,
        message: "User created successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).send(err)
    }
  }
);

export { router as signUpRouter };
