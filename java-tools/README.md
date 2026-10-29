# Algorush Java question-bank validator

This is the project's Java companion for question quality checks. It works on a downloaded JSON snapshot and produces reports. The browser game and question-entry page continue working without Java. No Java server, Firebase service account, Maven or third-party JAR is required.

## Requirements

- A **JDK 17 or newer** on the computer running the checker. Check with `java -version`.
- A question export from the Algorush admin page, or one of the included examples.

The implementation is compiled against the Java 17 API. The browser does not execute this Java code; GitHub Pages keeps serving the same static website.

## Check your real question bank

1. Open **Question Bank** on the website.
2. Click **EXPORT QUESTIONS**. This downloads all categories, including malformed records that gameplay normally filters out. It does not modify the bank.
3. Open a terminal in this `java-tools` folder.
4. Run the checker with the downloaded file's actual path:

   ```powershell
   .\run-validator.cmd "C:\Users\Nikko\Downloads\algorush-question-bank-YOUR-TIMESTAMP.json"
   ```

5. Open `reports/question-bank-report.html` in a browser.

The filename above is a placeholder: use the filename you actually downloaded. File paths with spaces need quotes. You can right-click the downloaded file in File Explorer and copy its path.

On macOS/Linux, or without the Windows wrapper:

```sh
java -Dfile.encoding=UTF-8 --source 17 src/QuestionBankTool.java /path/to/export.json --output reports
```

Export uses the existing browser's question-bank read permissions. If export is denied or the service is unavailable, its status explains the failure and you can retry; playing and adding questions do not depend on successful export or this tool.

## Try it before exporting

From this folder:

```powershell
.\run-validator.cmd .\examples\valid-bank.json --minimum 1
```

The example has eight valid questions, one in each category, and should report no errors or warnings with a minimum of one. For a demonstration of real findings:

```powershell
.\run-validator.cmd .\examples\problem-bank.json --minimum 1
```

That example intentionally produces **2 valid unique, 3 invalid and 1 duplicate** record, plus review warnings. Exit code 1 is expected because problems were found; the reports are still created.

## What the tool checks

- Required nonblank string fields, supported categories, and `text`/`4pics` formats.
- The game's answer/clue length limits (120/600 UTF-16 characters).
- Exactly four HTTP(S) image URLs without embedded usernames/passwords for picture questions.
- Duplicate **category + format + normalized answer** combinations.
- Case, whitespace and Unicode normalization while preserving punctuation such as `C++`.
- Invalid, excessive or intentionally shared accepted-answer aliases.
- Invalid/repeated record IDs and category coverage.

Image checks are **URL syntax checks only**. The checker does not fetch URLs, judge whether pictures are appropriate, or verify trivia facts. Shared aliases and small categories are warnings, not automatic proof that a question is wrong.

The default minimum is five valid unique questions per category. Change it with `--minimum 10`, or use `--minimum 0` to suppress category-size warnings. The chosen minimum does not change the website's match settings.

## Outputs and exit codes

Each run writes three files to `reports/` (or the specified `--output` directory):

| File | Purpose |
| --- | --- |
| `question-bank-report.html` | Human-readable summary, sorted category counts and findings |
| `question-bank-report.json` | Machine-readable counts, row/ID references and findings |
| `questions-validated.json` | A separate normalized copy containing the first valid unique records |

Re-running replaces generated reports. The tool protects the input file from being overwritten by these output filenames. It never connects to Firebase or imports/deletes questions. Correct questions through the existing admin workflow, then export and check again. The validated copy is for review/future tooling, not an automatic database update.

| Exit | Meaning |
| --- | --- |
| `0` | Audit finished without validation errors; warnings may remain |
| `1` | Audit finished and found question errors or duplicates; inspect the reports |
| `2` | Usage, JSON, unsupported schema, file-size or I/O error |

Inputs may be the version-1 Algorush export object or a plain JSON array. Limits: 10 MiB per input, 100,000 records, and JSON nesting of 64. Row numbers are 1-based positions in the exported `questions` array; row 0 means a bank-wide finding.

## Java / DSA presentation

The entry point is `src/QuestionBankTool.java`. The validator performs actual work on the same data used by the project:

| Structure / operation | Role |
| --- | --- |
| `ArrayDeque<IndexedQuestion>` | Processes records in FIFO export order |
| `HashMap<String, CategoryStats>` | Groups records and accumulates category coverage |
| `HashSet<AnswerKey>` | Detects duplicates using a normalized category/format/answer key |
| `HashMap<AnswerKey, Integer>` | Identifies the first row behind a duplicate |
| Alias/ID hash sets and maps | Finds repeated aliases, IDs and shared answer aliases |
| Comparators and sorting | Orders categories alphabetically and findings by severity/row/field |

Parsing and validation scan the data; expected hash lookup cost is constant under ordinary hashing. Sorting adds `O(k log k)` for categories and `O(i log i)` for `i` findings; storage grows with the input and findings. See [DSA notes](DSA.md) for the implementation walkthrough.

This implements Java in the **content-management workflow**, not inside gameplay. Your course rubric still determines whether that is the required role for Java.

## Tests

Run:

```powershell
.\test.cmd
```

Or compile and run directly:

```sh
javac --release 17 -encoding UTF-8 -d out src/QuestionBankTool.java tests/QuestionBankToolTest.java
java -cp out QuestionBankToolTest out/java-test-results.json
```

Tests cover validation, duplicate/alias semantics, parser errors, Unicode, HTML escaping, exit codes, limits and preservation of the original input. `out/` and `reports/` are generated and ignored by Git. Browser export and gameplay regression tests are maintained in the development workspace alongside this project.

## Publishing with the existing website

Keep `java-tools/` as a folder in the repository. The web integration also needs the updated `admin.html`, `admin.js`, `firebase-config.js`, and new `question-export.js` at the repository root. `README.md` and `CHANGELOG.md` document the feature.

No Pages settings or Java server are needed. If uploading through GitHub's browser interface, omit generated `out/` and `reports/` folders and downloaded real bank exports; browser uploads do not apply Git ignore rules. The Java source, examples, tests, launchers and guides are the files to publish.
