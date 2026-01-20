import { Database } from "bun:sqlite";
import path from "path";

// Open the database. 
// Assuming KoboReader.sqlite is in the project root.
const db = new Database("KoboReader.sqlite", { readonly: true });

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
}

export function getAnnotations(): Annotation[] {
  const query = db.query(`
    SELECT 
        c.BookTitle,
        b.Text,
        b.Annotation,
        b.DateCreated,
        b.DateModified,
        b.Type,
        b.Color,
        c.ContentID
    FROM Bookmark b
    JOIN content c on b.ContentID = c.ContentID
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
