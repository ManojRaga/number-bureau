# Number Bureau

**Every number has a secret.** A tactile, offline-friendly Class 8 maths game for **Ganita Prakash, Chapter 5 — Number Play**.

Six detective case files, 36 original investigations, 18 stars, and three open-ended experiment tools. Designed for children and volunteer-led classes: no timer, no accounts, no ads, no analytics, and no external fonts or services.

## Play

- Web: https://manojraga.github.io/number-bureau/
- Android: [Number-Bureau.apk](dist/Number-Bureau.apk)
- Downloadable web bundle: [Number-Bureau-Web.zip](dist/Number-Bureau-Web.zip)

The APK is a **debug-signed sideload build**, not a Play Store release. Android 7.0+ (API 24). It is a separate app (`com.manoj.numberbureau`) and does not replace the other chapter games. Enable installation from your download source only if you trust the APK. The Android package includes all game content; browser offline play becomes available after a successful first load.

## The six cases

| Case file | Ideas | Interactions |
| --- | --- | --- |
| The Sign Studio | Consecutive integers, parity, invariant reasoning | Number slider, sign switches, selection, proof ordering |
| The Remainder Room | Groups, remainders, sums/differences, simultaneous conditions | Counter trays, remainder dial, number entry |
| The Claims Office | Always/sometimes/never, counterexamples, LCM | Evidence selection and claim testing |
| The Digit Workshop | Divisibility by 2, 3, 4, 5, 6, 8, 9, 10, 11 | Missing-digit keypad, selections, signed sums |
| The Root Observatory | Repeated digit sums, modulo 9, parity pitfalls | Root calculations, families, counterexamples |
| The Cipher Vault | Cryptarithm rules, carries, multiplication, combined tests | Letter-to-digit decoder accepting every valid solution |

The **Play lab** is always available: a sign machine with all eight patterns; adjustable counters/trays; and a twelve-digit scanner showing roots, signed alternating sums, remainders and divisibility.

Aligned to the supplied 2026–27 Part 1 textbook, printed pages 112–135, sections 5.1–5.3. The optional Navakankari board activity is suggested as a physical partner extension, not implemented as a digital game. These are original activities and illustrations; the textbook PDF is not bundled.

Mathematical care: root 9 is distinguished from remainder 0; negative alternating sums are reduced to standard non-negative remainders; combined tests use the LCM; cryptarithms reject repeated letter digits and leading zeroes while accepting alternate valid solutions. Printed numerals do not reserve a digit against letters.

## Classroom use

Open **Settings → Classroom mode** to unlock all cases temporarily. Normal play unlocks cases in order. Field notes explain each idea and suggest questions to ask aloud. Let partners predict before moving a dial, explain a counterexample, or compare two valid codes.

Each completed case earns 1–3 stars: 3 for six unaided answers, 2 for four or five, 1 for completing and learning. Hints and retries are unlimited; a worked solution becomes available after two incorrect attempts. Invalid/incomplete entry does not count as an incorrect mathematical attempt. Best scores are preserved on replay. Progress saves after each answer and resumes at the next investigation; unfinished control positions are not saved. Classroom mode resets on reload.

## Develop

```sh
npm ci
npm start
# http://localhost:8170
npm test
```

Vanilla JavaScript ES modules, accessible native controls, code-native SVG/CSS art, a scoped service worker, and Capacitor 8.5 for Android. The proven shell/progress approach comes from the previous chapter games; the number puzzles, mathematical validators, experiments and art are new.

```sh
npm run android:sync
cd android
./gradlew assembleDebug
```

Use JDK 21+ and Android SDK 36; set the SDK path in your own ignored `android/local.properties`. Generated APK: `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it into `dist/Number-Bureau.apk` when preparing a release. Increment the service-worker cache identifier whenever publishing updated web assets.

`scripts/android-art.mjs` regenerates PNG launchers/splash images from `www/icons/icon.svg` using Sharp (pass its module path as the first argument). `scripts/browser-qa.mjs --full` plays every investigation using real controls and exercises labs, progress, retries, reset, responsive layouts and offline reload. It accepts `--playwright=…`, `--chromium=…`, `--width=320` and `--url=…` for the local test environment. Playwright and Sharp are development-only tools, not app runtime dependencies.

## Verification

`npm test` covers all 36 content entries, all possible missing-digit answers and cryptarithm assignments, parity with negative integers, strict input validation, progress persistence, and divisibility/root properties for 100,000 non-negative integers. Browser QA covers a full run, replay from 17 to 18 stars, hint persistence, saved answer boundaries, all three labs, 320/390/768 px layouts, service-worker scope and offline reload.

Android packaging/signatures and bundled-asset equality are checked separately. A physical-device classroom test is still recommended before broad distribution.

## Publish

Commit all changes on `main`, then `npm run deploy`. The script runs tests, splits `www` into `gh-pages`, pushes both branches, and explicitly requests a Pages build. Configure the repository's Pages source as `gh-pages` at `/` once. Only `www/` is served as the game; source and downloadable bundles remain on `main`.
