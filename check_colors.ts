import { Database } from "bun:sqlite";

const db = new Database("KoboReader.sqlite", { readonly: true });
const query = db.query("SELECT DISTINCT Color FROM Bookmark");
const rows = query.all();

console.log("Distinct Colors found:", rows);
