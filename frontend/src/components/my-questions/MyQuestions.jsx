import React, { useState, useEffect } from "react";
import { apiClient } from "../../services/core/api.client";
import { MessageSquare, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./MyQuestions.module.css";

function MyQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyQuestions = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get("/api/questions?mine=true");

        setQuestions(response.data.questions);
        setError(null);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to fetch questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyQuestions();
  }, []);

  return (
    <div className={styles["my-questions-container"]}>
      {/* Workspace Header */}
      <div className={styles["workspace-header"]}>
        <div className={styles["workspace-titles"]}>
          <span className={styles["workspace-tag"]}>YOUR WORKSPACE</span>

          <h1>Your topics</h1>

          <p>
            Only questions you created. Open one to read answers or add
            follow-ups. Rows use the same left accent as your threads on Home.
          </p>
        </div>

        <button
          className={styles["new-question-btn"]}
          onClick={() => navigate("/questions/ask")}
        >
          <Plus size={16} />
          New question
        </button>
      </div>

      {/* Content Body */}
      <div className={styles["questions-card-wrapper"]}>
        {/* Loading State */}
        {loading && (
          <div className={styles["state-message"]}>
            Loading your questions...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className={styles["error-box"]} role="alert">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && questions.length === 0 && (
          <div className={styles["empty-state-box"]}>
            <p>
              You have not asked any questions yet. Use Ask a Question in the
              sidebar to start.
            </p>
          </div>
        )}

        {/* Questions List */}
        {!loading && !error && questions.length > 0 && (
          <div className={styles["questions-list"]}>
            {questions.map((q) => (
              <div
                key={q.questionHash}
                className={styles["question-row-card"]}
                onClick={() => navigate(`/questions/${q.questionHash}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/questions/${q.questionHash}`);
                  }
                }}
              >
                {/* User Avatar */}
                <div className={styles["user-avatar-section"]}>
                  <div className={styles["avatar-circle"]}>
                    {q.author?.firstName?.[0]}
                    {q.author?.lastName?.[0]}
                  </div>
                </div>

                {/* Question Information */}
                <div className={styles["question-content-section"]}>
                  <div className={styles["question-header-row"]}>
                    <h3>{q.title}</h3>

                    <span className={styles["yours-badge"]}>YOURS</span>
                  </div>

                  <p>{q.body}</p>

                  {/* Question Metadata */}
                  <div className={styles["question-footer-meta"]}>
                    <span className={styles["replies-count"]}>
                      <MessageSquare size={14} />
                      {q.answerCount || 0} replies
                    </span>

                    <span className={styles["time-ago"]}>
                      {q.createdAt
                        ? new Date(q.createdAt).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyQuestions;
