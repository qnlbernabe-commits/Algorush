import java.io.IOException;
import java.io.PrintStream;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Offline content-quality companion. No network, credentials, or database writes. */
public final class QuestionBankTool {
    static final List<String> CATEGORIES = List.of("Tech & Computer", "Science", "Animals", "Movies & TV",
            "Sports", "Food & Drinks", "Geography", "General Knowledge");
    static final int MAX_FILE_BYTES = 10 * 1024 * 1024;
    static final int MAX_QUESTIONS = 100_000;
    // The whitespace set used by JavaScript trim()/\s, including BOM and NBSP.
    static final Pattern SPACE = Pattern.compile("[\\u0009-\\u000D\\u0020\\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000\\uFEFF]+");
    static final Pattern EDGE_SPACE = Pattern.compile("^" + SPACE.pattern() + "|" + SPACE.pattern() + "$");
    static final String OTHER_CATEGORY = "Unknown / invalid category";

    record Issue(String severity, int row, String id, String field, String message) {}
    record AnswerKey(String category, String type, String answer) {}
    record IndexedQuestion(int row, Object value) {}

    static final class CategoryStats {
        final String name;
        int total, accepted, invalid, duplicates;
        CategoryStats(String name) { this.name = name; }
        Map<String, Object> json() {
            return ordered("category", name, "total", total, "validUnique", accepted,
                    "invalid", invalid, "duplicates", duplicates);
        }
    }

    static final class Audit {
        int total, invalid, duplicates;
        final int minimum;
        final List<Map<String, Object>> accepted = new ArrayList<>();
        final List<Issue> issues = new ArrayList<>();
        final Map<String, CategoryStats> categories = new HashMap<>();
        Audit(int minimum) { this.minimum = minimum; CATEGORIES.forEach(c -> categories.put(c, new CategoryStats(c))); }
        void issue(String severity, int row, String id, String field, String message) {
            issues.add(new Issue(severity, row, id, field, message));
        }
        long errors() { return issues.stream().filter(i -> i.severity().equals("ERROR")).count(); }
        long warnings() { return issues.size() - errors(); }
        List<CategoryStats> sortedCategories() {
            return categories.values().stream().sorted(Comparator.comparing(c -> c.name)).toList();
        }
        Map<String, Object> json(String input) {
            List<Object> findings = new ArrayList<>();
            for (Issue i : issues) findings.add(ordered("severity", i.severity(), "row", i.row(),
                    "id", i.id(), "field", i.field(), "message", i.message()));
            return ordered("schemaVersion", 1, "tool", "Algorush Java Question Bank Validator",
                    "generatedAt", Instant.now().toString(), "inputFile", input,
                    "summary", ordered("total", total, "validUnique", accepted.size(), "invalid", invalid,
                            "duplicates", duplicates, "errors", errors(), "warnings", warnings(), "minimumPerCategory", minimum),
                    "categories", sortedCategories().stream().map(CategoryStats::json).toList(), "issues", findings,
                    "limitations", "Checks structure, URL syntax and duplicate/alias consistency only. It does not verify factual accuracy or fetch images. No database records are changed.");
        }
    }

    public static void main(String[] args) { System.exit(run(args, System.out, System.err)); }

    static int run(String[] args, PrintStream out, PrintStream err) {
        try {
            if (args.length == 1 && (args[0].equals("--help") || args[0].equals("-h"))) { usage(out); return 0; }
            if (args.length == 0) { usage(err); return 2; }
            Path input = null, output = Path.of("reports");
            int minimum = 5;
            for (int i = 0; i < args.length; i++) {
                switch (args[i]) {
                    case "--output" -> {
                        if (++i >= args.length) throw new IllegalArgumentException("--output needs a folder path.");
                        output = Path.of(args[i]);
                    }
                    case "--minimum" -> {
                        if (++i >= args.length) throw new IllegalArgumentException("--minimum needs an integer from 0 to 100000.");
                        try { minimum = Integer.parseInt(args[i]); }
                        catch (NumberFormatException e) { throw new IllegalArgumentException("--minimum must be an integer."); }
                        if (minimum < 0 || minimum > MAX_QUESTIONS) throw new IllegalArgumentException("--minimum must be from 0 to 100000.");
                    }
                    default -> {
                        if (args[i].startsWith("--")) throw new IllegalArgumentException("Unknown option: " + args[i]);
                        if (input != null) throw new IllegalArgumentException("Give one input JSON file. Quote paths containing spaces.");
                        input = Path.of(args[i]);
                    }
                }
            }
            if (input == null) throw new IllegalArgumentException("Give an exported question-bank JSON file.");
            input = input.toAbsolutePath().normalize();
            output = output.toAbsolutePath().normalize();
            if (!Files.isRegularFile(input)) throw new IllegalArgumentException("Input file does not exist: " + input);
            if (Files.size(input) > MAX_FILE_BYTES) throw new IllegalArgumentException("Input exceeds the 10 MiB limit. Export a smaller bank.");
            String source = Files.readString(input, StandardCharsets.UTF_8);
            if (source.startsWith("\uFEFF")) source = source.substring(1);
            Audit audit = analyze(Json.parse(source), minimum);
            String reportJson = Json.stringify(audit.json(input.toString())) + "\n";
            String validated = Json.stringify(ordered("schemaVersion", 1, "source", "Algorush Java validator",
                    "questions", audit.accepted)) + "\n";
            Map<String, String> files = new LinkedHashMap<>();
            files.put("question-bank-report.json", reportJson);
            files.put("question-bank-report.html", html(audit, input.toString()));
            files.put("questions-validated.json", validated);
            Path original = input.toRealPath();
            for (String filename : files.keySet()) {
                Path target = output.resolve(filename);
                if (target.equals(input) || (Files.exists(target) && Files.isSameFile(target, original)))
                    throw new IllegalArgumentException("The output would overwrite your input. Choose a different --output folder.");
            }
            Files.createDirectories(output);
            for (Map.Entry<String, String> file : files.entrySet()) Files.writeString(output.resolve(file.getKey()), file.getValue(), StandardCharsets.UTF_8);
            out.printf("Algorush Java question-bank audit%nRecords: %d | Valid unique: %d | Invalid: %d | Duplicates: %d%nErrors: %d | Warnings: %d%n",
                    audit.total, audit.accepted.size(), audit.invalid, audit.duplicates, audit.errors(), audit.warnings());
            out.println("Open report: " + output.resolve("question-bank-report.html"));
            out.println("Validated copy: " + output.resolve("questions-validated.json"));
            out.println("Your original file and live question bank were not modified.");
            return audit.errors() == 0 ? 0 : 1;
        } catch (IllegalArgumentException | IOException e) {
            err.println("Cannot audit question bank: " + e.getMessage());
            err.println("Use --help for usage. No live database access is used.");
            return 2;
        }
    }

    static void usage(PrintStream out) {
        out.println("Usage: java --source 17 src/QuestionBankTool.java <bank.json> [--output reports] [--minimum 5]");
        out.println("Accepts an Algorush export object or a JSON array. Requires JDK 17 or newer; no libraries or server.");
        out.println("Exit 0 = no validation errors (warnings may remain); 1 = question problems reported; 2 = input/usage/I/O error.");
    }

    static Audit analyze(Object root, int minimum) {
        if (minimum < 0 || minimum > MAX_QUESTIONS) throw new IllegalArgumentException("Invalid minimum question count.");
        Object records = root;
        if (root instanceof Map<?, ?> envelope) {
            Object version = envelope.get("schemaVersion");
            if (version != null && (!(version instanceof Number) || new BigDecimal(version.toString()).compareTo(BigDecimal.ONE) != 0))
                throw new IllegalArgumentException("Unsupported export schemaVersion. Expected 1.");
            records = envelope.get("questions");
        }
        if (!(records instanceof List<?> rows)) throw new IllegalArgumentException("Expected a JSON array or an export object with a questions array.");
        if (rows.size() > MAX_QUESTIONS) throw new IllegalArgumentException("Too many records (maximum 100000).");
        Audit result = new Audit(minimum);
        result.total = rows.size();
        ArrayDeque<IndexedQuestion> queue = new ArrayDeque<>();
        for (int i = 0; i < rows.size(); i++) queue.addLast(new IndexedQuestion(i + 1, rows.get(i)));
        Set<AnswerKey> seenAnswers = new HashSet<>();
        Map<AnswerKey, Integer> firstRows = new HashMap<>();
        Map<AnswerKey, AnswerKey> aliasOwners = new HashMap<>();
        Set<String> ids = new HashSet<>();
        while (!queue.isEmpty()) {
            IndexedQuestion record = queue.removeFirst();
            int row = record.row();
            if (!(record.value() instanceof Map<?, ?> data)) {
                result.categories.computeIfAbsent(OTHER_CATEGORY, CategoryStats::new).total++;
                result.categories.get(OTHER_CATEGORY).invalid++;
                result.invalid++;
                result.issue("ERROR", row, "", "question", "Question must be a JSON object.");
                continue;
            }
            String id = data.get("id") instanceof String value ? value : "";
            String category = clean(data.get("category"));
            CategoryStats stats = result.categories.computeIfAbsent(CATEGORIES.contains(category) ? category : OTHER_CATEGORY, CategoryStats::new);
            stats.total++;
            int errorStart = result.issues.size();
            if (!CATEGORIES.contains(category)) result.issue("ERROR", row, id, "category", "Missing or unsupported category.");
            String type = data.get("type") instanceof String value ? value : "";
            if (!type.equals("text") && !type.equals("4pics")) result.issue("ERROR", row, id, "type", "Type must be text or 4pics.");
            String answer = requiredText(data, "answer", 120, row, id, result);
            String clue = requiredText(data, "clue", 600, row, id, result);
            List<String> images = new ArrayList<>();
            if (type.equals("4pics")) {
                if (!(data.get("images") instanceof List<?> values) || values.size() != 4) {
                    result.issue("ERROR", row, id, "images", "A picture puzzle needs exactly four image URLs.");
                } else for (int i = 0; i < values.size(); i++) {
                    if (!validImageUrl(values.get(i))) result.issue("ERROR", row, id, "images[" + i + "]", "Use an absolute HTTP(S) image URL without credentials (maximum 2048 characters).");
                    else images.add(((String) values.get(i)).trim());
                }
            }
            if (result.issues.size() > errorStart) { result.invalid++; stats.invalid++; continue; }
            AnswerKey canonical = new AnswerKey(category, type, normalizeAnswer(answer));
            if (!seenAnswers.add(canonical)) {
                result.duplicates++; stats.duplicates++;
                result.issue("ERROR", row, id, "answer", "Duplicate category/type/answer; first occurrence is row " + firstRows.get(canonical) + ".");
                continue;
            }
            firstRows.put(canonical, row);
            if (data.containsKey("id") && (!(data.get("id") instanceof String) || id.isBlank() || id.contains("/")))
                result.issue("WARNING", row, id, "id", "ID is missing/invalid; the local validated copy will omit it.");
            else if (!id.isEmpty() && !ids.add(id)) result.issue("WARNING", row, id, "id", "Document ID occurs more than once in this export.");
            List<String> aliases = new ArrayList<>();
            Set<String> seenAliases = new HashSet<>();
            aliases.add(canonical.answer()); seenAliases.add(canonical.answer());
            Object rawAliases = data.get("acceptedAnswers");
            if (rawAliases != null && !(rawAliases instanceof List<?>)) result.issue("WARNING", row, id, "acceptedAnswers", "Aliases must be an array; this field was ignored in the local validated copy.");
            if (rawAliases instanceof List<?> values) {
                if (values.size() > 12) result.issue("WARNING", row, id, "acceptedAnswers", "Only the first 12 aliases are used, matching the browser's limit.");
                for (int i = 0; i < Math.min(12, values.size()); i++) {
                    Object value = values.get(i);
                    String normalized = normalizeAnswer(value);
                    if (!(value instanceof String text) || normalized.isEmpty() || trimJs(text).length() > 120 || normalized.length() > 120) {
                        result.issue("WARNING", row, id, "acceptedAnswers[" + i + "]", "Invalid alias was ignored in the local validated copy.");
                    } else if (seenAliases.add(normalized)) aliases.add(normalized);
                }
            }
            for (String alias : aliases) {
                AnswerKey aliasKey = new AnswerKey(category, type, alias);
                AnswerKey owner = aliasOwners.putIfAbsent(aliasKey, canonical);
                if (owner != null && !owner.equals(canonical)) result.issue("WARNING", row, id, "acceptedAnswers", "Accepted answer '" + alias + "' also belongs to another canonical answer in this category/format; review intentionally shared aliases.");
            }
            Map<String, Object> question = ordered("category", category, "type", type, "clue", clue, "answer", answer, "acceptedAnswers", aliases);
            if (!id.isEmpty() && !id.contains("/")) question.put("id", id);
            if (type.equals("4pics")) question.put("images", images);
            result.accepted.add(question); stats.accepted++;
        }
        if (rows.isEmpty()) result.issue("ERROR", 0, "", "questions", "The export contains no questions.");
        for (String category : CATEGORIES) {
            CategoryStats stats = result.categories.get(category);
            if (stats.accepted < minimum) result.issue("WARNING", 0, "", "category", category + ": " + stats.accepted + " valid unique questions; requested minimum is " + minimum + ".");
        }
        result.issues.sort(Comparator.comparingInt((Issue i) -> i.severity().equals("ERROR") ? 0 : 1)
                .thenComparingInt(Issue::row).thenComparing(Issue::field).thenComparing(Issue::message));
        return result;
    }

    static String requiredText(Map<?, ?> data, String field, int maximum, int row, String id, Audit result) {
        Object raw = data.get(field);
        String value = clean(raw);
        if (!(raw instanceof String text) || value.isEmpty()) result.issue("ERROR", row, id, field, "Must contain text, not a missing value or only whitespace.");
        else if (trimJs(text).length() > maximum || value.length() > maximum) result.issue("ERROR", row, id, field, "Exceeds the " + maximum + " UTF-16 character limit.");
        return value;
    }

    static String clean(Object value) {
        return value instanceof String text ? SPACE.matcher(Normalizer.normalize(text, Normalizer.Form.NFKC)).replaceAll(" ").trim() : "";
    }
    static String normalizeAnswer(Object value) { return clean(value).toLowerCase(Locale.ROOT); }
    static String trimJs(String value) { return EDGE_SPACE.matcher(value).replaceAll(""); }

    static boolean validImageUrl(Object value) {
        if (!(value instanceof String text) || text.length() > 2048) return false;
        try {
            URI uri = new URI(text.trim());
            return ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                    && uri.getHost() != null && uri.getRawUserInfo() == null && uri.getPort() >= -1 && uri.getPort() <= 65535;
        } catch (URISyntaxException e) { return false; }
    }

    static Map<String, Object> ordered(Object... pairs) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) map.put((String) pairs[i], pairs[i + 1]);
        return map;
    }

    static String escapeHtml(Object value) {
        StringBuilder out = new StringBuilder();
        String.valueOf(value).codePoints().forEach(code -> {
            switch (code) {
                case '&' -> out.append("&amp;"); case '<' -> out.append("&lt;");
                case '>' -> out.append("&gt;"); case '"' -> out.append("&quot;"); case '\'' -> out.append("&#39;");
                default -> {
                    if (code >= 0xd800 && code <= 0xdfff) out.append("&#xfffd;");
                    else out.appendCodePoint(code);
                }
            }
        });
        return out.toString();
    }

    static String html(Audit audit, String input) {
        StringBuilder page = new StringBuilder("""
                <!doctype html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Algorush — Java question-bank report</title>
                <style>body{font:16px/1.5 system-ui,sans-serif;background:#f3f5fa;color:#182033;margin:0;padding:24px}main{max-width:1100px;margin:auto}h1{line-height:1.2}section{background:white;border:1px solid #cfd5e3;border-radius:12px;padding:20px;margin:20px 0}table{border-collapse:collapse;width:100%;font-size:14px}td,th{text-align:left;border-bottom:1px solid #dce1ec;padding:9px;vertical-align:top;overflow-wrap:anywhere}th{background:#edf1f8}.table{overflow:auto}.ERROR{color:#a31a27;font-weight:700}.WARNING{color:#785000;font-weight:700}.summary{font-size:18px;font-weight:700}code{background:#edf1f8;padding:2px 4px}small{color:#445067}a{color:#164a9f}</style>
                <main><h1>Algorush question-bank audit</h1><p>Generated by the Java companion tool. This is an offline report, not a live database editor.</p>
                """);
        page.append("<p><small>Input: ").append(escapeHtml(input)).append("</small></p><section><h2>")
                .append(audit.errors() == 0 ? "No validation errors" : "Questions need attention")
                .append("</h2><p class=summary>").append(audit.total).append(" records · ").append(audit.accepted.size())
                .append(" valid unique · ").append(audit.invalid).append(" invalid · ").append(audit.duplicates)
                .append(" duplicates</p><p>").append(audit.errors()).append(" errors · ").append(audit.warnings()).append(" warnings</p>")
                .append("<p>Review factual accuracy and picture availability separately. URL checks are syntax-only. Your source file and Firebase records have not been modified.</p></section>")
                .append("<section><h2>Category coverage</h2><p>Minimum target: ").append(audit.minimum).append(" valid unique questions per category.</p>")
                .append("<div class=table><table><thead><tr><th>Category</th><th>Total</th><th>Valid unique</th><th>Invalid</th><th>Duplicates</th></tr></thead><tbody>");
        for (CategoryStats c : audit.sortedCategories()) page.append("<tr><td>").append(escapeHtml(c.name)).append("</td><td>").append(c.total)
                .append("</td><td>").append(c.accepted).append("</td><td>").append(c.invalid).append("</td><td>").append(c.duplicates).append("</td></tr>");
        page.append("</tbody></table></div></section><section><h2>Findings</h2><p>Row numbers are 1-based positions in the exported questions array. Row 0 means the whole bank.</p>")
                .append("<div class=table><table><thead><tr><th>Severity</th><th>Row / ID</th><th>Field</th><th>Finding</th></tr></thead><tbody>");
        for (Issue issue : audit.issues) page.append("<tr><td class=").append(issue.severity()).append(">").append(issue.severity())
                .append("</td><td>").append(issue.row()).append("<br>").append(escapeHtml(issue.id())).append("</td><td>")
                .append(escapeHtml(issue.field())).append("</td><td>").append(escapeHtml(issue.message())).append("</td></tr>");
        if (audit.issues.isEmpty()) page.append("<tr><td colspan=4>No findings.</td></tr>");
        page.append("</tbody></table></div></section><section><h2>Local outputs</h2><p><a href=question-bank-report.json>JSON report</a> · <a href=questions-validated.json>Validated question copy</a></p>")
                .append("<p>The validated copy preserves the first valid unique question in each category/format/answer group. Invalid or duplicate entries remain in your original export and are listed above. Nothing is automatically imported or deleted.</p></section></main></html>\n");
        return page.toString();
    }

    /** Small strict JSON reader/writer so this tool needs only a JDK, not Maven/JAR downloads. */
    static final class Json {
        final String text;
        int cursor;
        Json(String text) { this.text = text; }
        static Object parse(String text) {
            Json reader = new Json(text);
            Object value = reader.value(0);
            reader.space();
            if (reader.cursor != text.length()) throw reader.error("Unexpected trailing content");
            return value;
        }
        IllegalArgumentException error(String message) { return new IllegalArgumentException(message + " at character " + (cursor + 1) + "."); }
        void space() { while (cursor < text.length() && " \t\r\n".indexOf(text.charAt(cursor)) >= 0) cursor++; }
        char next() { if (cursor == text.length()) throw error("Unexpected end of JSON"); return text.charAt(cursor++); }
        boolean take(char token) { if (cursor < text.length() && text.charAt(cursor) == token) { cursor++; return true; } return false; }
        void expect(char token) { if (!take(token)) throw error("Expected '" + token + "'"); }
        Object value(int depth) {
            if (depth > 64) throw error("JSON nesting is too deep (maximum 64)");
            space();
            if (cursor == text.length()) throw error("Missing JSON value");
            char token = text.charAt(cursor);
            if (token == '"') return string();
            if (token == '{') {
                cursor++; space(); Map<String, Object> map = new LinkedHashMap<>();
                if (take('}')) return map;
                do {
                    space(); if (cursor == text.length() || text.charAt(cursor) != '"') throw error("Object keys must be quoted");
                    String key = string(); space(); expect(':');
                    Object item = value(depth + 1);
                    if (map.containsKey(key)) throw error("Duplicate JSON object key '" + key + "'");
                    map.put(key, item); space();
                    if (take('}')) return map;
                    expect(',');
                } while (true);
            }
            if (token == '[') {
                cursor++; space(); List<Object> list = new ArrayList<>();
                if (take(']')) return list;
                do { list.add(value(depth + 1)); space(); if (take(']')) return list; expect(','); } while (true);
            }
            for (String literal : List.of("true", "false", "null")) {
                if (text.startsWith(literal, cursor)) { cursor += literal.length(); return literal.equals("null") ? null : literal.equals("true"); }
            }
            return number();
        }
        String string() {
            expect('"'); StringBuilder value = new StringBuilder();
            while (true) {
                char token = next();
                if (token == '"') return value.toString();
                if (token < 0x20) throw error("Unescaped control character in string");
                if (token != '\\') { value.append(token); continue; }
                char escaped = next();
                switch (escaped) {
                    case '"', '\\', '/' -> value.append(escaped);
                    case 'b' -> value.append('\b'); case 'f' -> value.append('\f');
                    case 'n' -> value.append('\n'); case 'r' -> value.append('\r'); case 't' -> value.append('\t');
                    case 'u' -> {
                        int code = 0;
                        for (int i = 0; i < 4; i++) {
                            char hex = next();
                            int digit = hex >= '0' && hex <= '9' ? hex - '0' : hex >= 'a' && hex <= 'f' ? hex - 'a' + 10 : hex >= 'A' && hex <= 'F' ? hex - 'A' + 10 : -1;
                            if (digit < 0) throw error("Invalid Unicode escape");
                            code = code * 16 + digit;
                        }
                        value.append((char) code);
                    }
                    default -> throw error("Invalid string escape");
                }
            }
        }
        BigDecimal number() {
            int start = cursor;
            take('-');
            if (!take('0')) {
                if (cursor == text.length() || text.charAt(cursor) < '1' || text.charAt(cursor) > '9') throw error("Expected a JSON value");
                while (cursor < text.length() && text.charAt(cursor) >= '0' && text.charAt(cursor) <= '9') cursor++;
            }
            if (take('.')) digits();
            if (take('e') || take('E')) { if (!take('+')) take('-'); digits(); }
            if (cursor - start > 128) throw error("JSON number is too long");
            try { return new BigDecimal(text.substring(start, cursor)); }
            catch (NumberFormatException e) { throw error("Invalid JSON number"); }
        }
        void digits() {
            int start = cursor;
            while (cursor < text.length() && text.charAt(cursor) >= '0' && text.charAt(cursor) <= '9') cursor++;
            if (start == cursor) throw error("Expected a digit");
        }
        static String stringify(Object value) { StringBuilder out = new StringBuilder(); write(value, out); return out.toString(); }
        static void write(Object value, StringBuilder out) {
            if (value == null) out.append("null");
            else if (value instanceof String string) {
                out.append('"');
                for (int i = 0; i < string.length(); i++) {
                    char c = string.charAt(i);
                    switch (c) {
                        case '"' -> out.append("\\\""); case '\\' -> out.append("\\\\");
                        case '\n' -> out.append("\\n"); case '\r' -> out.append("\\r"); case '\t' -> out.append("\\t");
                        case '\b' -> out.append("\\b"); case '\f' -> out.append("\\f");
                        default -> { if (c < 0x20 || Character.isSurrogate(c)) out.append(String.format("\\u%04x", (int) c)); else out.append(c); }
                    }
                }
                out.append('"');
            } else if (value instanceof Boolean) out.append(value);
            else if (value instanceof Number number) {
                if ((number instanceof Double d && !Double.isFinite(d)) || (number instanceof Float f && !Float.isFinite(f)))
                    throw new IllegalArgumentException("JSON numbers must be finite.");
                out.append(number);
            }
            else if (value instanceof Map<?, ?> map) {
                out.append('{'); boolean first = true;
                for (Map.Entry<?, ?> entry : map.entrySet()) {
                    if (!(entry.getKey() instanceof String)) throw new IllegalArgumentException("JSON object keys must be strings.");
                    if (!first) out.append(','); first = false; write(entry.getKey(), out); out.append(':'); write(entry.getValue(), out);
                }
                out.append('}');
            } else if (value instanceof Iterable<?> list) {
                out.append('['); boolean first = true;
                for (Object item : list) { if (!first) out.append(','); first = false; write(item, out); }
                out.append(']');
            } else throw new IllegalArgumentException("Unsupported JSON value type.");
        }
    }
}
