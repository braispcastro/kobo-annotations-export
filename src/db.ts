import { Database } from "bun:sqlite";
import path from "path";

// Open the database in the data folder.
const db = new Database("data/KoboReader.sqlite", { readonly: true });

export interface Annotation {
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
  // We join content 'c' (the file) and 'ch' (the chapter/toc entry)
  // Kobo usually stores chapters as separate content rows with ContentID ending in -N
  // and ContentType '899' (for kepubs).
  const query = db.query(`
    SELECT 
        c.BookTitle,
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
    JOIN content c on b.ContentID = c.ContentID
    LEFT JOIN content ch 
        ON ch.BookID = c.BookID 
        AND ch.ContentID LIKE (c.ContentID || '-%')
        AND ch.ContentType = '899'
    WHERE (b.Type = 'highlight' OR b.Type = 'note')
      AND (b.Text IS NOT NULL OR b.Annotation IS NOT NULL)
    ORDER BY c.BookTitle, b.DateCreated
  `);

  const rows = query.all() as any[];

  return rows.map((row) => {
    // Extract Author from ContentID
    // Format: .../Calibre/Author Name/ Book Title...
    let author = "Unknown Author";
    const match = row.ContentID.match(/Calibre\/([^/]+)\//);
    if (match) {
      author = match[1];
    }

    return {
      BookTitle: row.BookTitle || "Unknown Book",
      Text: row.Text,
      Annotation: row.Annotation,
      DateCreated: row.DateCreated,
      DateModified: row.DateModified,
      Type: row.Type,
      Color: row.Color,
      ContentID: row.ContentID,
      Author: author,
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
