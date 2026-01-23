import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = "data";

export interface Annotation {
  BookmarkID: string;
  BookTitle: string;
  Text: string | null;
  Annotation: string | null;
  DateCreated: string;
  DateModified: string | null;
  Type: string;
  Color: string | null;
  ContentID: string;
  Author: string; // Derived
  ChapterProgress: number;
  ChapterTitle: string | null;
}

/**
 * Gets the list of available databases (subdirectories in the data folder)
 */
export function getDatabases(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  return fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => fs.existsSync(path.join(DATA_DIR, name, "KoboReader.sqlite")));
}

/**
 * Opens a connection to a specific database
 */
function getDbConnection(dbName: string) {
  const dbPath = path.join(DATA_DIR, dbName, "KoboReader.sqlite");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found: ${dbPath}`);
  }
  return new Database(dbPath, { readonly: true });
}

export function getAnnotations(dbName: string): Annotation[] {
  const db = getDbConnection(dbName);
  try {
    const query = db.query(`
      SELECT 
          b.BookmarkID,
          c.BookTitle,
          m.Attribution as AuthorName,
          b.Text,
          b.Annotation,
          b.DateCreated,
          b.DateModified,
          b.Type,
          b.Color,
          c.ContentID,
          b.ChapterProgress,
          ch.Title as ChapterTitle
      FROM Bookmark b
      JOIN content c ON b.ContentID = c.ContentID
      LEFT JOIN content m ON c.BookID = m.ContentID AND m.ContentType = '6'
      LEFT JOIN content ch 
          ON ch.BookID = c.BookID 
          AND ch.ContentID LIKE (c.ContentID || '-%')
          AND ch.ContentType = '899'
      WHERE (b.Type = 'highlight' OR b.Type = 'note' OR b.Type = 'markup')
      ORDER BY c.BookTitle, b.DateCreated
    `);

    const rows = query.all() as any[];

    return rows.map((row) => {
      return {
        BookmarkID: row.BookmarkID,
        BookTitle: row.BookTitle || "Unknown Book",
        Text: row.Text,
        Annotation: row.Annotation,
        DateCreated: row.DateCreated,
        DateModified: row.DateModified,
        Type: row.Type,
        Color: row.Color,
        ContentID: row.ContentID,
        Author: row.AuthorName || "Unknown Author",
        ChapterProgress: row.ChapterProgress || 0,
        ChapterTitle: row.ChapterTitle || null,
      };
    });
  } finally {
    db.close();
  }
}

export function getGroupedAnnotations(dbName: string) {
  const annotations = getAnnotations(dbName);
  const tree: Record<string, Record<string, Annotation[]>> = {};

  for (const annot of annotations) {
    if (!tree[annot.Author]) {
      tree[annot.Author] = {};
    }
    if (!tree[annot.Author][annot.BookTitle]) {
      tree[annot.Author][annot.BookTitle] = [];
    }
    tree[annot.Author][annot.BookTitle].push(annot);
  }

  return tree;
}
