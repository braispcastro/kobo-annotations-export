import { Database } from "bun:sqlite";
import path from "path";

// Open the database in the data folder.
const db = new Database("data/KoboReader.sqlite", { readonly: true });

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

export function getAnnotations(): Annotation[] {
  // We join content 'c' (the specific file/chapter where the bookmark is)
  // 'm' is the master book entry (ContentType 6) to get the Author (Attribution)
  // 'ch' is for chapter titles (ContentType 899)
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
}

export function getGroupedAnnotations() {
  const annotations = getAnnotations();
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
