import express, { Request, Response } from "express";
const router = express.Router();

router.get("/health", async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ message: "API's are healthy" });
  } catch (error: any) {
    return res.status(500).json({ error: `Server error: ${error}` });
  }
});

export default router;
