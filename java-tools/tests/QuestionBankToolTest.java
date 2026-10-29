import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/** Dependency-free tests of observable validation and CLI behavior. */
public final class QuestionBankToolTest {
    interface Check { void run() throws Exception; }
    static final List<Map<String, Object>> results = new ArrayList<>();
    static void test(String name, Check check) {
        try { check.run(); results.add(QuestionBankTool.ordered("name", name, "status", "pass")); System.out.println("PASS " + name); }
        catch (Exception | AssertionError e) { results.add(QuestionBankTool.ordered("name", name, "status", "fail", "error", e.toString())); System.out.println("FAIL " + name + ": " + e); }
    }
    static void require(boolean condition) { if (!condition) throw new AssertionError("Condition failed"); }
    static void equal(Object expected, Object actual) { if (!expected.equals(actual)) throw new AssertionError("Expected " + expected + ", got " + actual); }
    static void invalid(Runnable action) { try { action.run(); } catch (IllegalArgumentException e) { return; } throw new AssertionError("Expected an input error"); }
    static Map<String, Object> question(String category, String answer) { return QuestionBankTool.ordered("category", category, "type", "text", "clue", "A test clue.", "answer", answer); }
    static Map<String, Object> question(String answer) { return question("Tech & Computer", answer); }
    static QuestionBankTool.Audit audit(Object... rows) { return QuestionBankTool.analyze(Arrays.asList(rows), 0); }
    static Map<String, Object> picture(String answer) {
        Map<String, Object> q = question(answer); q.put("type", "4pics");
        q.put("images", List.of("https://example.com/1.png", "http://localhost/2.png", "https://example.com/3.svg", "https://example.com/4.jpg")); return q;
    }
    static int cli(String... args) { return QuestionBankTool.run(args, new PrintStream(new ByteArrayOutputStream()), new PrintStream(new ByteArrayOutputStream())); }
    static void deleteTree(Path root) throws IOException {
        if (!Files.exists(root)) return;
        try (var paths = Files.walk(root)) { for (Path p : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(p); }
    }

    public static void main(String[] args) throws Exception {
        test("NFKC, case, Unicode spaces and BOM match canonical answers", () -> {
            equal("algorithm", QuestionBankTool.normalizeAnswer("\uFEFF  ＡＬＧＯＲＩＴＨＭ\u00A0\t"));
            equal("pacific ocean", QuestionBankTool.normalizeAnswer("Pacific\n  Ocean"));
            equal("é", QuestionBankTool.normalizeAnswer("e\u0301"));
            equal("", QuestionBankTool.normalizeAnswer(null));
        });
        test("Meaningful punctuation is preserved", () -> { require(!QuestionBankTool.normalizeAnswer("C").equals(QuestionBankTool.normalizeAnswer("C++"))); equal(2, audit(question("C"), question("C++")).accepted.size()); });
        test("JSON values, nested objects, escapes and Unicode round trip", () -> {
            String source = "{\"s\":\"Quote \\\" slash \\\\ newline \\n emoji \\ud83d\\ude80\",\"n\":-1.25e+3,\"items\":[true,false,null,{},[]]}";
            Object value = QuestionBankTool.Json.parse(source);
            equal(value, QuestionBankTool.Json.parse(QuestionBankTool.Json.stringify(value)));
        });
        test("Malformed JSON is rejected with no permissive comments or duplicate keys", () -> {
            for (String source : List.of("", "[1,]", "{\"x\":1,}", "{\"x\":1,\"x\":2}", "01", "1.", "1e", "+1", "-.1", "NaN", "true false", "[", "{x:1}", "\"a\nb\"", "\"\\q\"", "\"\\u12G4\"", "\"\\u１２３４\"", "//comment\n[]")) invalid(() -> QuestionBankTool.Json.parse(source));
        });
        test("Excessive JSON nesting and oversized number tokens are bounded", () -> { invalid(() -> QuestionBankTool.Json.parse("[".repeat(66) + "0" + "]".repeat(66))); invalid(() -> QuestionBankTool.Json.parse("1".repeat(129))); });
        test("Nonfinite numbers cannot be emitted as JSON", () -> invalid(() -> QuestionBankTool.Json.stringify(Double.NaN)));
        test("Both an export envelope and a plain array are accepted", () -> {
            equal(1, audit(question("Stack")).accepted.size());
            equal(1, QuestionBankTool.analyze(QuestionBankTool.ordered("schemaVersion", 1, "questions", List.of(question("Queue"))), 0).accepted.size());
            equal(1, QuestionBankTool.analyze(QuestionBankTool.Json.parse("{\"schemaVersion\":1.0,\"questions\":[{\"category\":\"Science\",\"type\":\"text\",\"answer\":\"Atom\",\"clue\":\"Clue\"}]}"), 0).accepted.size());
        });
        test("Unsupported schemas and wrong root shapes are rejected", () -> { invalid(() -> QuestionBankTool.analyze(QuestionBankTool.ordered("schemaVersion", 2, "questions", List.of()), 0)); invalid(() -> QuestionBankTool.analyze(Map.of(), 0)); invalid(() -> QuestionBankTool.analyze("text", 0)); });
        test("An empty bank reports an actionable error", () -> { var a = audit(); equal(0, a.total); equal(1L, a.errors()); });
        test("Nonobject records are isolated rather than stopping the bank audit", () -> { var a = audit(null, 3, "text", question("Stack")); equal(4, a.total); equal(3, a.invalid); equal(1, a.accepted.size()); });
        test("Missing, blank and nonstring required fields are rejected", () -> {
            var missing = question("Stack"); missing.remove("answer");
            var number = question("Queue"); number.put("answer", 3);
            var blankClue = question("Graph"); blankClue.put("clue", "\u00A0 ");
            var a = audit(missing, number, question("  "), blankClue); equal(4, a.invalid); equal(0, a.accepted.size());
        });
        test("Answer/clue limits use UTF-16 length and trim browser whitespace", () -> {
            var a = question("x".repeat(121)); var b = question("Fine"); b.put("clue", "x".repeat(601));
            var c = question("\uFEFF" + "x".repeat(120) + "\uFEFF");
            var result = audit(a, b, c); equal(2, result.invalid); equal(1, result.accepted.size());
        });
        test("Unsupported categories/formats are isolated with category counts", () -> {
            var a = question("Invalid", "Answer"); var b = question("Answer2"); b.put("type", "other");
            var result = audit(a, b); equal(2, result.invalid); equal(2, result.categories.values().stream().mapToInt(c -> c.total).sum());
        });
        test("Duplicate canonical answers share a category and format", () -> {
            var a = audit(question("Algorithm"), question(" ＡＬＧＯＲＩＴＨＭ "), question("Science", "Algorithm"), picture("Algorithm"));
            equal(1, a.duplicates); equal(3, a.accepted.size()); equal(4, a.total);
        });
        test("FIFO processing preserves the first valid duplicate and row reference", () -> {
            var first = question("Stack"); first.put("id", "keep-this"); var next = question("STACK"); next.put("id", "later");
            var a = audit(first, next); equal("keep-this", a.accepted.get(0).get("id")); require(a.issues.get(0).message().contains("row 1"));
        });
        test("A malformed earlier row does not suppress a later valid answer", () -> { var bad = question("Stack"); bad.remove("clue"); var a = audit(bad, question("Stack")); equal(1, a.invalid); equal(0, a.duplicates); equal(1, a.accepted.size()); });
        test("Valid four-picture URLs are kept; incomplete pictures are excluded", () -> { var bad = picture("Cat"); bad.put("images", List.of("https://example.com/1.png")); var a = audit(picture("Dog"), bad); equal(1, a.invalid); equal(1, a.accepted.size()); });
        test("Image URL schemes, credentials, ports and malformed URLs are checked without fetching", () -> {
            for (String url : List.of("javascript:alert(1)", "file:///tmp/test.png", "https://user:password@example.com/1.png", "relative.png", "https://example.com:70000/1.png", "http://example.com:-2/x", "https://example.com/a b.png")) require(!QuestionBankTool.validImageUrl(url));
            require(QuestionBankTool.validImageUrl("https://example.com/a%20b.png")); require(!QuestionBankTool.validImageUrl(7));
        });
        test("Aliases normalize and deduplicate while invalid aliases produce warnings", () -> {
            var q = question("Pacific Ocean"); q.put("acceptedAnswers", Arrays.asList(" Pacific ", "PACIFIC OCEAN", 7, null, ""));
            var a = audit(q); equal(List.of("pacific ocean", "pacific"), a.accepted.get(0).get("acceptedAnswers")); equal(0L, a.errors()); equal(3L, a.warnings());
        });
        test("Aliases honor the browser limit and report a nonarray field", () -> {
            var q = question("First"); q.put("acceptedAnswers", java.util.stream.IntStream.range(0, 14).mapToObj(i -> "Alias " + i).toList());
            var other = question("Second"); other.put("acceptedAnswers", "not an array"); var a = audit(q, other);
            equal(2L, a.warnings()); equal(13, ((List<?>) a.accepted.get(0).get("acceptedAnswers")).size());
        });
        test("Shared aliases across canonical answers are review warnings, not deletions", () -> {
            var a = question("A"); a.put("acceptedAnswers", List.of("Shared")); var b = question("B"); b.put("acceptedAnswers", List.of("SHARED"));
            var result = audit(a, b); equal(2, result.accepted.size()); equal(1L, result.warnings()); equal(0L, result.errors());
        });
        test("IDs are optional, invalid IDs are omitted, and repeated IDs are flagged", () -> {
            var a = question("A"); a.put("id", "same"); var b = question("B"); b.put("id", "same"); var c = question("C"); c.put("id", "bad/id");
            var result = audit(a, b, c, question("D")); equal(4, result.accepted.size()); equal(2L, result.warnings()); require(!result.accepted.get(2).containsKey("id"));
        });
        test("Category coverage includes every supported category in sorted order", () -> {
            var a = QuestionBankTool.analyze(List.of(question("Stack")), 5); equal(8L, a.warnings());
            var names = a.sortedCategories().stream().map(c -> c.name).toList(); var sorted = names.stream().sorted().toList(); equal(sorted, names); equal(8, names.size());
        });
        test("Report errors sort before warnings without changing question order", () -> {
            var bad = question("  "); var q = question("A"); q.put("acceptedAnswers", List.of(4)); var a = audit(q, bad);
            equal("ERROR", a.issues.get(0).severity()); equal("A", a.accepted.get(0).get("answer"));
        });
        test("Report HTML escapes file names, IDs and finding text", () -> {
            var q = question("  "); q.put("id", "<img src=x onerror=alert(1)>"); var html = QuestionBankTool.html(audit(q), "<script>alert(1)</script>");
            require(!html.contains("<script>")); require(!html.contains("<img")); require(html.contains("&lt;script&gt;")); require(html.contains("&lt;img"));
        });
        test("CLI help and invalid options return useful exit codes", () -> { equal(0, cli("--help")); equal(2, cli()); equal(2, cli("--unknown")); equal(2, cli("--minimum", "wrong")); equal(2, cli("--minimum", "-1")); equal(2, cli("--output")); });
        test("Malformed Unicode cannot break UTF-8 HTML output", () -> {
            var q = question("  "); q.put("id", String.valueOf((char) 0xd800));
            String html = QuestionBankTool.html(audit(q), "input.json"); require(html.contains("&#xfffd;"));
            Path file = Files.createTempFile("algorush-unicode-", ".html");
            try { Files.writeString(file, html, StandardCharsets.UTF_8); require(Files.size(file) > 0); }
            finally { Files.delete(file); }
        });

        Path temporary = Files.createTempDirectory("algorush-java-tests-");
        try {
            test("CLI writes parseable reports and preserves the original input", () -> {
                Path input = temporary.resolve("valid bank.json"), output = temporary.resolve("valid-output");
                String content = QuestionBankTool.Json.stringify(List.of(question("Stack"))); Files.writeString(input, content);
                equal(0, cli(input.toString(), "--output", output.toString(), "--minimum", "0")); equal(content, Files.readString(input));
                require(Files.exists(output.resolve("question-bank-report.html")));
                Object report = QuestionBankTool.Json.parse(Files.readString(output.resolve("question-bank-report.json"))); require(report instanceof Map);
                Object validated = QuestionBankTool.Json.parse(Files.readString(output.resolve("questions-validated.json"))); equal(1, ((List<?>) ((Map<?, ?>) validated).get("questions")).size());
            });
            test("CLI reports bad records with exit 1 and exports only valid unique questions", () -> {
                Path input = temporary.resolve("problems.json"), output = temporary.resolve("problem-output");
                Files.writeString(input, QuestionBankTool.Json.stringify(List.of(question("Stack"), question("STACK"), question("  "))));
                equal(1, cli(input.toString(), "--output", output.toString()));
                var result = (Map<?, ?>) QuestionBankTool.Json.parse(Files.readString(output.resolve("questions-validated.json"))); equal(1, ((List<?>) result.get("questions")).size());
            });
            test("Malformed JSON and invalid UTF-8 fail without creating reports", () -> {
                Path input = temporary.resolve("malformed.json"), output = temporary.resolve("must-not-exist"); Files.writeString(input, "[1,");
                equal(2, cli(input.toString(), "--output", output.toString())); require(!Files.exists(output)); equal("[1,", Files.readString(input));
                Files.write(input, new byte[] {(byte) 0xc3, (byte) 0x28}); equal(2, cli(input.toString(), "--output", output.toString()));
            });
            test("UTF-8 BOM input is accepted", () -> {
                Path input = temporary.resolve("bom.json"); Files.writeString(input, "\uFEFF" + QuestionBankTool.Json.stringify(List.of(question("Stack"))));
                equal(0, cli(input.toString(), "--minimum", "0", "--output", temporary.resolve("bom-out").toString()));
            });
            test("Missing inputs and file-shaped output directories fail cleanly", () -> {
                equal(2, cli(temporary.resolve("missing.json").toString())); Path input = temporary.resolve("valid bank.json"); Path output = temporary.resolve("not-a-folder"); Files.writeString(output, "Preserve");
                equal(2, cli(input.toString(), "--output", output.toString())); equal("Preserve", Files.readString(output));
            });
            test("Generated filenames cannot overwrite the input export", () -> {
                Path input = temporary.resolve("questions-validated.json"); String source = QuestionBankTool.Json.stringify(List.of(question("Stack"))); Files.writeString(input, source);
                equal(2, cli(input.toString(), "--output", temporary.toString())); equal(source, Files.readString(input));
            });
            test("Oversized inputs are rejected before parsing", () -> {
                Path input = temporary.resolve("large.json"); Files.write(input, new byte[QuestionBankTool.MAX_FILE_BYTES + 1]);
                equal(2, cli(input.toString(), "--output", temporary.resolve("large-out").toString())); require(!Files.exists(temporary.resolve("large-out")));
            });
        } finally { deleteTree(temporary); }
        long failed = results.stream().filter(r -> r.get("status").equals("fail")).count();
        String json = QuestionBankTool.Json.stringify(QuestionBankTool.ordered("passed", results.size() - failed, "failed", failed, "results", results));
        if (args.length == 1) { Path output = Path.of(args[0]); if (output.toAbsolutePath().getParent() != null) Files.createDirectories(output.toAbsolutePath().getParent()); Files.writeString(output, json + "\n", StandardCharsets.UTF_8); }
        System.out.printf("%d passed, %d failed%n", results.size() - failed, failed);
        if (failed != 0) System.exit(1);
    }
}
