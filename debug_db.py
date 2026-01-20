import sqlite3
import os

db_path = 'KoboReader.sqlite'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Content Table Columns ---")
cursor.execute("PRAGMA table_info(content)")
for col in cursor.fetchall():
    print(col)

print("\n--- Bookmark Sample ---")
cursor.execute("SELECT VolumeID, contentID FROM Bookmark LIMIT 1")
bookmark = cursor.fetchone()
print(f"Bookmark Sample: {bookmark}")

if bookmark:
    vol_id = bookmark[0]
    print(f"\n--- Content Entry for VolumeID {vol_id} ---")
    cursor.execute(f"SELECT * FROM content WHERE ContentID = ?", (vol_id,))
    content_row = cursor.fetchone()
    
    # Get column names
    names = [description[0] for description in cursor.description]
    if content_row:
        for name, val in zip(names, content_row):
            if name in ['BookTitle', 'Title', 'Attribution', 'ContentID']:
                print(f"{name}: {val}")

    content_id = bookmark[1]
    print(f"\n--- Content Entry for ContentID {content_id} ---")
    cursor.execute(f"SELECT * FROM content WHERE ContentID = ?", (content_id,))
    content_row_c = cursor.fetchone()
    if content_row_c:
        for name, val in zip(names, content_row_c):
            if name in ['BookTitle', 'Title', 'Attribution', 'ContentID']:
                print(f"{name}: {val}")

conn.close()
