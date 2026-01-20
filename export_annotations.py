import sqlite3
import os
import sys
import re
import datetime

def get_application_path():
    """
    Returns the path to the application directory.
    If frozen (compiled), returns the directory of the executable.
    Otherwise, returns the directory of the script.
    """
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

def get_db_path(base_path):
    return os.path.join(base_path, 'KoboReader.sqlite')

def clean_filename(filename):
    """
    Removes invalid characters from filenames.
    """
    return re.sub(r'[<>:"/\\|?*]', '', filename).strip()

def extract_author(content_id):
    """
    Extracts author name from ContentID using regex.
    Expected format: .../Calibre/Author Name/ Book Title...
    """
    match = re.search(r'Calibre/([^/]+)/', content_id)
    if match:
        return match.group(1)
    return "Unknown Author"

def format_date(date_str):
    if not date_str:
        return ""
    # Kobo dates can be timestamps or strings. 
    # Usually they are ISO strings like 2023-01-20T21:23:50
    return date_str.replace('T', ' ')

def main():
    base_path = get_application_path()
    db_path = get_db_path(base_path)
    
    print(f"Looking for database at: {db_path}")

    if not os.path.exists(db_path):
        print("Error: KoboReader.sqlite not found in the current directory.")
        input("Press Enter to exit...")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Query to get bookmarks and book details for both highlighted text and notes
        # Using ContentID as the join key as requested by the user.
        query = """
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
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        if not rows:
            print("No annotations found.")
            conn.close()
            return

        annotations_by_author = {}

        print(f"Found {len(rows)} annotations. Processing...")

        for row in rows:
            book_title = row[0]
            text = row[1]
            annotation_note = row[2]
            date_created = row[3]
            date_modified = row[4]
            annot_type = row[5]
            color = row[6]
            content_id_path = row[7] # Using ContentID from content table which holds path info

            if not book_title:
                book_title = "Unknown Book"

            author = extract_author(content_id_path)
            
            if author not in annotations_by_author:
                annotations_by_author[author] = {}
            
            if book_title not in annotations_by_author[author]:
                annotations_by_author[author][book_title] = []

            annotations_by_author[author][book_title].append({
                "text": text,
                "annotation": annotation_note,
                "date_created": date_created,
                "date_modified": date_modified,
                "type": annot_type,
                "color": color
            })

        conn.close()

        # Create Directory Structure
        output_dir = os.path.join(base_path, "Annotations")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        for author, books in annotations_by_author.items():
            author_dir = os.path.join(output_dir, clean_filename(author))
            if not os.path.exists(author_dir):
                os.makedirs(author_dir)
            
            for book_title, annots in books.items():
                file_path = os.path.join(author_dir, f"{clean_filename(book_title)}.md")
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(f"# {book_title}\n\n")
                    f.write(f"**Author**: {author}\n")
                    f.write(f"**Exported**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    
                    for item in annots:
                        # Color Mapping
                        # 3 - Verde, 2 - Azul, 1 - Rosa, 0 - Amarillo
                        color_map = {
                            "3": "lightgreen",
                            "2": "lightblue",
                            "1": "pink",
                            "0": "yellow"
                        }
                        
                        # Use raw color value if not in map, or default to generic highlight if missing
                        # Kobo stores color as a string in the DB? Let's assume it matches the keys.
                        # Sometimes it might be None.
                        # Ensure we convert to string because SQLite might return ints
                        color_key = str(item['color']) if item['color'] is not None else "none"
                        bg_color = color_map.get(color_key, "lightgray")
                        
                        # Highlighted Text
                        if item['text']:
                            # Using HTML for visual color representation as standard Markdown doesn't support it.
                            # This works well in GitHub, Obsidian (with HTML enabled), and browsers.
                            f.write(f"<blockquote style=\"border-left: 5px solid {bg_color}; background-color: {bg_color}33; padding: 10px;\">\n")
                            f.write(f"{item['text']}\n")
                            f.write("</blockquote>\n\n")
                        
                        # User Note
                        if item['annotation']:
                            f.write(f"**Note**: {item['annotation']}\n\n")
                        
                        # Metadata footer for the annotation
                        # Map readable color name for the footer
                        readable_colors = {
                            "3": "Green",
                            "2": "Blue",
                            "1": "Pink",
                            "0": "Yellow"
                        }
                        color_name = readable_colors.get(color_key, item['color'])
                        
                        f.write(f"_{item['type']} | {color_name} | {format_date(item['date_created'])}_\n")
                        f.write("---\n\n")

        print("Export completed successfully!")
        print(f"Files saved in: {output_dir}")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
    
    # Keep window open if it's an executable run
    if getattr(sys, 'frozen', False):
        input("Press Enter to close...")

if __name__ == "__main__":
    main()
