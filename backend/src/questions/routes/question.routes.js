import express from "express";

import {
  createQuestionController,
  listQuestionsController,
} from "../controller/question.controller.js";

const router = express.Router();

router.get("/", listQuestionsController);
router.post("/", createQuestionController);

export default router;
