import { getDatabase } from "@netlify/database";

const db = getDatabase();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...(init.headers || {}) },
  });

function toInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const studentName = (body.studentName || body.student_name || "").toString().trim();
      if (!studentName) {
        return json({ error: "studentName is required" }, { status: 400 });
      }
      const studentId = body.studentId ? body.studentId.toString() : null;
      const mode = (body.mode || "general").toString();
      const level = toInt(body.level, 0);
      const score = toInt(body.score, 0);
      const stars = Math.max(0, Math.min(3, toInt(body.stars, 0)));
      const xpTotal = toInt(body.xpTotal ?? body.xp_total, 0);
      const timeTaken = body.timeTaken != null ? toInt(body.timeTaken, 0) : null;
      const hintsUsed = body.hintsUsed != null ? toInt(body.hintsUsed, 0) : null;
      const metadata = body.metadata && typeof body.metadata === "object" ? JSON.stringify(body.metadata) : null;

      const [row] = await db.sql`
        INSERT INTO student_scores
          (student_name, student_id, mode, level, score, stars, xp_total, time_taken_seconds, hints_used, metadata)
        VALUES
          (${studentName}, ${studentId}, ${mode}, ${level}, ${score}, ${stars}, ${xpTotal}, ${timeTaken}, ${hintsUsed}, ${metadata})
        RETURNING *
      `;

      return json({ ok: true, score: row }, { status: 201 });
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const studentName = url.searchParams.get("studentName");
      const mode = url.searchParams.get("mode");
      const limit = Math.min(100, Math.max(1, toInt(url.searchParams.get("limit"), 25)));
      const view = url.searchParams.get("view");

      if (view === "leaderboard") {
        const rows = await db.sql`
          SELECT student_name,
                 SUM(score)::int AS total_score,
                 SUM(stars)::int AS total_stars,
                 MAX(xp_total)::int AS best_xp,
                 COUNT(*)::int AS plays,
                 MAX(created_at) AS last_play
          FROM student_scores
          ${mode ? db.sql`WHERE mode = ${mode}` : db.sql``}
          GROUP BY student_name
          ORDER BY total_score DESC, total_stars DESC
          LIMIT ${limit}
        `;
        return json({ ok: true, leaderboard: rows });
      }

      let rows;
      if (studentName && mode) {
        rows = await db.sql`
          SELECT * FROM student_scores
          WHERE student_name = ${studentName} AND mode = ${mode}
          ORDER BY created_at DESC LIMIT ${limit}
        `;
      } else if (studentName) {
        rows = await db.sql`
          SELECT * FROM student_scores
          WHERE student_name = ${studentName}
          ORDER BY created_at DESC LIMIT ${limit}
        `;
      } else if (mode) {
        rows = await db.sql`
          SELECT * FROM student_scores
          WHERE mode = ${mode}
          ORDER BY created_at DESC LIMIT ${limit}
        `;
      } else {
        rows = await db.sql`
          SELECT * FROM student_scores
          ORDER BY created_at DESC LIMIT ${limit}
        `;
      }

      return json({ ok: true, scores: rows });
    }

    return json({ error: "Method not allowed" }, { status: 405 });
  } catch (err) {
    console.error("scores function error", err);
    return json({ error: "Internal error", message: err?.message || String(err) }, { status: 500 });
  }
};

export const config = {
  path: "/api/scores",
};
