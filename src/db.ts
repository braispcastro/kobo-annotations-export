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
    .filter(name => {
      const sqlitePath = path.join(DATA_DIR, name, "KoboReader.sqlite");
      return fs.existsSync(sqlitePath);
    });
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

export function getAuthors(dbName: string): { name: string; bookCount: number }[] {
  const db = getDbConnection(dbName);
  try {
    const query = db.query(`
      SELECT 
          IFNULL(m.Attribution, 'Unknown Author') as AuthorName,
          COUNT(DISTINCT c.BookTitle) as BookCount
      FROM Bookmark b
      JOIN content c ON b.ContentID = c.ContentID
      LEFT JOIN content m ON c.BookID = m.ContentID AND m.ContentType = '6'
      WHERE (b.Type = 'highlight' OR b.Type = 'note' OR b.Type = 'markup')
      GROUP BY AuthorName
      ORDER BY AuthorName
    `);

    const rows = query.all() as any[];
    return rows.map(row => ({
      name: row.AuthorName,
      bookCount: row.BookCount
    }));
  } finally {
    db.close();
  }
}

export function getBooksByAuthor(dbName: string, author: string): { title: string; annotationCount: number }[] {
  const db = getDbConnection(dbName);
  try {
    const query = db.query(`
      SELECT 
          c.BookTitle,
          COUNT(b.BookmarkID) as AnnotationCount
      FROM Bookmark b
      JOIN content c ON b.ContentID = c.ContentID
      LEFT JOIN content m ON c.BookID = m.ContentID AND m.ContentType = '6'
      WHERE (b.Type = 'highlight' OR b.Type = 'note' OR b.Type = 'markup')
      AND IFNULL(m.Attribution, 'Unknown Author') = ?
      GROUP BY c.BookTitle
      ORDER BY c.BookTitle
    `);

    const rows = query.all(author) as any[];
    return rows.map(row => ({
      title: row.BookTitle || "Unknown Book",
      annotationCount: row.AnnotationCount
    }));
  } finally {
    db.close();
  }
}

export function getAnnotationsByBook(dbName: string, author: string, book: string): Annotation[] {
  const db = getDbConnection(dbName);
  try {
    const query = db.query(`
      SELECT 
          b.BookmarkID,
          c.BookTitle,
          IFNULL(m.Attribution, 'Unknown Author') as AuthorName,
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
      AND IFNULL(m.Attribution, 'Unknown Author') = ?
      AND c.BookTitle = ?
      ORDER BY c.VolumeIndex, b.ChapterProgress
    `);

    const rows = query.all(author, book) as any[];

    return rows.map((row) => ({
      BookmarkID: row.BookmarkID,
      BookTitle: row.BookTitle || "Unknown Book",
      Text: row.Text,
      Annotation: row.Annotation,
      DateCreated: row.DateCreated,
      DateModified: row.DateModified,
      Type: row.Type,
      Color: row.Color,
      ContentID: row.ContentID,
      Author: row.AuthorName,
      ChapterProgress: row.ChapterProgress || 0,
      ChapterTitle: row.ChapterTitle || null,
    }));
  } finally {
    db.close();
  }
}
