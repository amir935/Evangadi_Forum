import { StatusCodes } from "http-status-codes";
import {
  createQuestionService,
  listQuestionsService,
} from "../service/question.service.js";
import { NotFoundError } from "../../../utils/errors/index.js";
import { safeExecute } from "../../../../db/config.js";

export const createQuestionController = async (req, res, next) => {
  try {
    const question = await createQuestionService({
      userId: req.user.id,
      title: req.body.title,
      body: req.body.body,
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Question posted successfully.",
      question,
    });
  } catch (error) {
    next(error);
  }
};

export const listQuestionsController = async (req, res, next) => {
  try {
    const questions = await listQuestionsService({
      userId: req.user.id,
      search: req.query.search,
      mine: req.query.mine === "true" || req.query.mine === "1",
      limit: req.query.limit,
    });
    res
      .status(StatusCodes.OK)
      .json({ success: true, count: questions.length, questions });
  } catch (error) {
    next(error);
  }
};
