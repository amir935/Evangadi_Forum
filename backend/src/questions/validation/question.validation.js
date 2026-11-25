import { body, query } from "express-validator";
import { validationErrorHandler } from "../../middleware/validation-handler.js";

// Accept content as an alias for body (the DB column is body).
const acceptContentAsBody = (req, res, next) => {
  if (
    req.body &&
    req.body.body === undefined &&
    req.body.content !== undefined
  ) {
    req.body.body = req.body.content;
  }
  next();
};

export const createQuestionValidation = [
  acceptContentAsBody,
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isLength({ min: 5, max: 255 })
    .withMessage("Title must be between 5 and 255 characters"),

  body("content")
    .isString()
    .withMessage("Question body must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Question body is required")
    .bail()
    .isLength({ min: 10 })
    .withMessage("Question body must be at least 10 characters"),

  validationErrorHandler,
];

export const listQuestionValidation = [
  query("search")
    .optional()
    .trim()
    .isString()
    .withMessage("Search must be a string")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Search is too long"),

  query("mine")
    .optional()
    .isIn(["true", "false", "1", "0"])
    .withMessage("Mine must be true, false, 1, or 0"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Limit must be between 1 and 200"),

  validationErrorHandler,
];
