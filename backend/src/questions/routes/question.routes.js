import express from "express";

import {
  createQuestionController,
  listQuestionsController,
} from "../controller/question.controller.js";
import {
  createQuestionValidation,
  listQuestionValidation,
} from "../validation/question.validation.js";

const router = express.Router();

router.get("/", listQuestionValidation, listQuestionsController);

router.post("/", createQuestionValidation, createQuestionController);

export default router;
