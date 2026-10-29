# Java data flow and DSA walkthrough

The feature is a content-quality pipeline:

```text
Firestore questions (browser read only)
  → Export Questions JSON download
  → Java JSON parser
  → FIFO record validation
  → category / duplicate / alias indexes
  → sorted HTML + JSON reports and a separate validated copy
```

The website export deliberately retains invalid values. Otherwise the Java tool could only inspect records that JavaScript had already accepted, hiding the very problems it should diagnose. It exports the known audit fields rather than unrelated document metadata. No server credentials are downloaded or needed by Java.

`QuestionBankTool.analyze` creates an `ArrayDeque<IndexedQuestion>`. The record wrapper carries a stable 1-based row number and can hold an invalid/null value. Removing from the front preserves export order, so the first valid record remains the winner when duplicates occur later.

A category `HashMap` accumulates totals, valid unique entries, malformed entries and duplicate entries. An immutable `AnswerKey` record combines category, format and normalized answer. Its value equality is suitable for `HashSet` membership without ambiguous string concatenation. A matching first-row map points users to the original occurrence. Malformed rows do not reserve an answer key, so a valid later entry is still usable.

Normalization uses NFKC, the browser's whitespace set and locale-independent lowercase. Punctuation remains meaningful. Thus ` ＡＬＧＯＲＩＴＨＭ ` matches `algorithm`, while `C` and `C++` remain distinct. Accepted aliases are separately deduplicated and indexed. An alias shared by different canonical answers is a review warning rather than an automatic deletion.

`Comparator` chains sort findings with errors first, then row, field and message. Category summaries sort alphabetically. The original processing order of accepted records is preserved. Missing/invalid questions, duplicates and accepted questions are disjoint counts that sum to the original record count.

The dependency-free JSON reader is intentionally strict: duplicate object keys, comments, trailing commas, malformed numbers/escapes and excessive nesting are rejected. The writer escapes strings. HTML rendering separately escapes paths, IDs and finding messages; question text is never interpreted as report markup.

For input size `n`, parsing and per-record checks scan the input. Hash operations have expected constant lookup cost under ordinary hashing; the documentation does not claim that worst-case collisions are impossible. Sorting `i` findings takes `O(i log i)` comparisons. Category sorting takes `O(k log k)`, with eight supported categories plus an optional invalid-category bucket. Memory is proportional to input size, accepted records, aliases and findings. The queue is a deliberate FIFO processing stage; it does not make parsing or storage constant-space.

Useful source references:

- [Java HashMap API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HashMap.html)
- [Java HashSet API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HashSet.html)
- [Java ArrayDeque API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ArrayDeque.html)
- [Java Normalizer API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/text/Normalizer.html)

For a classroom demo, export a bank in the admin page, run Java on that downloaded file, inspect the report, then point to these structures in the source. The website's saved questions are unaffected by running or skipping this check.
