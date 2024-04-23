import e, { Request, Response, Router, Application } from "express";
import { check } from "express-validator";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { splitToken } from "../helpers";
import config from "../config/config";
import jwt from "jsonwebtoken";

const router = Router();

// Set up admin route to create events
router.post(
  "/create-event",
  [
    check("title", "Please include a title").isString(),
    check("description", "Please include a description").isString(),
    check("date", "Please include a date").isString(),
    check("location", "Please include a location").isString(),
    check("price", "Please include a price").isFloat(),
    check("image", "Please include an image").isString(),
  ],
  async (req: Request, res: Response) => {
    try {
      const { title, description, date, location, price, image } = req.body;

      const prisma = new PrismaClient();

      let token: string | string[] | undefined = req.headers["set-cookie"];

      if (Array.isArray(token)) {
        token = token[0];
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token, authorization denied",
        });
      }

      let loggedToken = splitToken(token);

      const decoded = jwt.verify(loggedToken, config.JWT_SECRET);

      const payload = decoded as { id: string; email: string; role: UserRole };


      

      //find if user exists
      const user = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
        select: {
          role: true,
        },
      });

      if (user && user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create event",
        });
      }

     

      const eventExists = await prisma.event.findUnique({
        where: {
          title,
        },
        select: {
          title: true,
          description: true,
        },
      });

      if (eventExists) {
        return res.status(400).json({
          success: false,
          message: "Event already exists",
        });
      }

      //Admin to create event
      let newEvent = await prisma.event.create({
        data: {
          title,
          description,
          date,
          location,
          price,
          image,
          createdBy: {
            connect: {
              id: payload.id,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: newEvent,
        message: "Event created successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

export { router as eventRouter };
