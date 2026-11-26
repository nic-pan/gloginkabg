-- Comments. "page" names one post: "diary", "library", "diary-2", "news-1" ...
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page       TEXT NOT NULL,
  name       TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL,   -- ISO 8601, UTC
  ip_hash    TEXT NOT NULL    -- for the rate limit only
);
CREATE INDEX IF NOT EXISTS comments_page ON comments (page, id);
CREATE INDEX IF NOT EXISTS comments_ip ON comments (ip_hash, created_at);

-- One row for each visitor on each day. Old days are deleted.
CREATE TABLE IF NOT EXISTS visits (
  day  TEXT NOT NULL,         -- YYYY-MM-DD, Europe/Sofia
  hash TEXT NOT NULL,
  PRIMARY KEY (day, hash)
) WITHOUT ROWID;

-- Unique visitors for each day. Kept forever.
CREATE TABLE IF NOT EXISTS daily_counts (
  day   TEXT PRIMARY KEY,
  count INTEGER NOT NULL
);

-- One vote for each visitor. A new vote replaces the old one.
CREATE TABLE IF NOT EXISTS rating_votes (
  voter      TEXT PRIMARY KEY,
  value      INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
  updated_at TEXT NOT NULL
);
