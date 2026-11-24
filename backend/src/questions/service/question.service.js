import crypto from "node:crypto";
import { safeExecute } from "../../../../db/config.js";
import { NotFoundError, BadRequestError } from "../../../utils/errors/index.js";

const QUESTION_SELECT = `
    SELECT q.question_id, q.question_hash, q.user_id, q.title, q.content, q.created_at,
           u.first_name, u.last_name,
            (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.question_id) AS answer_count
    FROM questions q
    JOIN users u ON u.user_id = q.user_id`;

const toQuestion = (row, currentUserId) => ({
  questionHash: row.question_hash,
  title: row.title,
  body: row.content,
  createdAt: row.created_at,
  answerCount: Number(row.answer_count ?? 0),
  isMine: row.user_id === currentUserId,
  author: {
    id: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
  },
});

const newQuestionHash = () => crypto.randomBytes(8).toString("hex");

async function createQuestionService({ userId, title, body }) {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  const questionHash = newQuestionHash();

  // Generate an embedding for the question content.
  let embedding = null;
  let embeddingModel = null;

  await safeExecute(
    `INSERT INTO questions (question_hash, user_id, title, content)
   VALUES (?, ?, ?, ?)`,
    [questionHash, userId, cleanTitle, cleanBody],
  );

  const rows = await safeExecute(
    `${QUESTION_SELECT} WHERE q.question_hash = ?`,
    [questionHash],
  );
  return toQuestion(rows[0], userId);
}

function clampLimit(value, fallback, max) {
  const n = parseInt(value);

  if (isNaN(n) || n < 1) {
    return fallback;
  }

  return Math.min(max, n);
}

async function listQuestionsService({ userId, search, mine, limit }) {
  const where = [];
  const params = [];

  if (mine) {
    where.push("q.user_id = ?");
    params.push(userId);
  }

  if (search) {
    where.push("(q.title LIKE ? OR q.content LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const sql =
    QUESTION_SELECT +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    " ORDER BY q.created_at DESC, q.question_id DESC" +
    ` LIMIT ${clampLimit(limit, 100, 200)}`;

  const rows = await safeExecute(sql, params);
  return rows.map((row) => toQuestion(row, userId));
}

export { createQuestionService, listQuestionsService, clampLimit };
