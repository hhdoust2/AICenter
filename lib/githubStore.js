const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.GITHUB_DATA_PATH || "users.json";
const TOKEN = process.env.GITHUB_TOKEN;

function apiUrl() {
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
}

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

// خواندن کل فایل داده از ریپازیتوری داده (نه ریپازیتوری اصلی سایت)
export async function readUsers() {
  const res = await fetch(`${apiUrl()}?ref=${BRANCH}`, { headers: headers() });

  if (res.status === 404) {
    return { users: [], sha: null };
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`خطای خواندن از GitHub (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf8");
  let users = [];
  try {
    users = JSON.parse(content).users || [];
  } catch {
    users = [];
  }
  return { users, sha: data.sha };
}

// نوشتن کل فایل داده - هر بار یک commit جدید در ریپازیتوری داده ایجاد می‌شود
export async function writeUsers(users, sha) {
  const content = Buffer.from(JSON.stringify({ users }, null, 2), "utf8").toString("base64");
  const body = {
    message: `update users data (${new Date().toISOString()})`,
    content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(apiUrl(), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`خطای نوشتن در GitHub (${res.status}): ${errBody}`);
  }
  return res.json();
}
