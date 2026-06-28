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

export interface KoboStats {
  totalBooks: number;
  readBooks: number;
  readingBooks: number;
  totalAnnotations: number;
  timeSpentHours: number;
  colorDistribution: Record<string, number>;
  achievements: { name: string; description: string; date: string }[];
  recentBooks: { title: string; author: string; progress: number; lastRead: string }[];
}

export function getKoboStats(dbName: string): KoboStats {
  const db = getDbConnection(dbName);
  try {
    // Basic Counts & Time
    const general = db.query(`
      SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ReadStatus = 2 THEN 1 ELSE 0 END) as readCount,
          SUM(CASE WHEN ReadStatus = 1 THEN 1 ELSE 0 END) as readingCount,
          SUM(IFNULL(TimeSpentReading, 0)) / 3600 as hours
      FROM content 
      WHERE ContentType = '6'
    `).get() as any;

    // Annotation Colors
    const colors = db.query(`
      SELECT Color, COUNT(*) as count 
      FROM Bookmark 
      WHERE Type IN ('highlight', 'note')
      GROUP BY Color
    `).all() as any[];

    const colorDist: Record<string, number> = { "0": 0, "1": 0, "2": 0, "3": 0 };
    colors.forEach(c => {
      if (c.Color !== null) colorDist[String(c.Color)] = c.count;
    });

    // Total Annotations (including markups)
    const totalAnnot = db.query(`
      SELECT COUNT(*) as total 
      FROM Bookmark 
      WHERE Type IN ('highlight', 'note', 'markup')
    `).get() as any;

    // Achievements
    const achievements = db.query(`
      SELECT Name, CompleteDescription, DateCreated 
      FROM Achievement 
      WHERE PercentComplete = 100
      ORDER BY DateCreated DESC
    `).all() as any[];

    // Recent Books (In Progress)
    const recent = db.query(`
      SELECT 
          Title, 
          IFNULL(Attribution, 'Unknown Author') as Author, 
          ___PercentRead as Progress, 
          DateLastRead
      FROM content 
      WHERE ContentType = '6' 
        AND ___PercentRead > 0 
        AND ___PercentRead < 100
        AND DateLastRead IS NOT NULL
      ORDER BY DateLastRead DESC
      LIMIT 4
    `).all() as any[];

    return {
      totalBooks: general.total || 0,
      readBooks: general.readCount || 0,
      readingBooks: general.readingCount || 0,
      totalAnnotations: totalAnnot.total || 0,
      timeSpentHours: Math.round(general.hours || 0),
      colorDistribution: colorDist,
      achievements: achievements.map(a => ({
        name: a.Name,
        description: a.CompleteDescription,
        date: a.DateCreated
      })),
      recentBooks: recent.map(r => ({
        title: r.Title,
        author: r.Author,
        progress: r.Progress || 0,
        lastRead: r.DateLastRead
      }))
    };
  } finally {
    db.close();
  }
}

export interface VocabWord {
  Text: string;
  BookTitle: string | null;
  Author: string | null;
  DictSuffix: string | null;
  DateCreated: string;
}

export function getVocab(dbName: string): VocabWord[] {
  const db = getDbConnection(dbName);
  try {
    const query = db.query(`
      SELECT
        w.Text,
        c.Title,
        c.Attribution AS AuthorName,
        w.DictSuffix,
        w.DateCreated
      FROM WordList w
      LEFT JOIN content c ON w.VolumeId = c.ContentID AND c.ContentType = '6'
      ORDER BY w.DateCreated DESC
    `);

    return (query.all() as any[]).map((row) => ({
      Text: row.Text,
      BookTitle: row.Title ?? null,
      Author: row.AuthorName ?? null,
      DictSuffix: row.DictSuffix ?? null,
      DateCreated: row.DateCreated,
    }));
  } finally {
    db.close();
  }
}
