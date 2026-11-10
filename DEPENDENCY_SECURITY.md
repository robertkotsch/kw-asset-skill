# Dependency security review

Checked 2026-11-10 with `pnpm audit --json` against the npm advisory database.
This repository ships templates, not an installed application or root lockfile.
The checks used separate generated projects under `/workspace/kw-onboarding`;
they do not imply every possible downstream dependency resolution is safe.

## Default asset workflow

- API: official prebuilt npm release **4.1.0**, installed with an exact version.
  Upstream `master`, `HEAD`, and latest release tag `v.4.1.0` resolve to that commit.
  There is no newer upstream API code to adopt as of this check.
- Vite: **8.3.7**; ZIP packager: **yazl 3.3.1**.
- Runtime: Node.js **20.19+ or 22.12+**; tested Node **24.22.1**, pnpm **10.23.0**.
- Full installed sample graph (including API UI, dev tools, and browser test tooling):
  **0 known advisories**, 47 dependency entries reported by the audit service.
- Archiver was removed from both ZIP templates. Even Archiver 8.0.0 pulled
  `readdir-glob > minimatch@10.2.6`, affected by
  [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
  The replacement uses yazl, whose only direct dependency is `buffer-crc32`;
  it needs no minimatch override.

Copy `resources/pnpm-workspace.yaml` before installing. It permits only
esbuild dependency builds; the prebuilt API has no install/prepare scripts. Copy the new ZIP template
along with changing the dependency; it is not compatible with the old Archiver API.
Keep `yazl` in devDependencies and commit the generated asset's lockfile.
The ZIP helper streams file content, puts files at the archive root, preserves
empty directories, and rejects symlinks/special files instead of following them.

## Optional multi-game workflow

All dependencies listed by the multi-game guides were resolved together and
scanned, including dev and transitive dependencies: **0 known advisories**, 227
entries reported by the audit service. Resolved direct versions:

| Package | Version |
| --- | --- |
| `d3` | 7.9.2 |
| `gsap` | 3.15.1 |
| `pixi.js` | 8.22.0 |
| `resize-observer-polyfill` | 1.5.1 |
| `@types/node` | 26.6.6 |
| `cross-env` | 10.1.0 |
| `sass` | 1.108.1 |
| `typescript` | 7.0.2 |
| `vite` | 8.3.7 |
| `vite-plugin-html` | 3.2.2 |
| `vite-plugin-zip-pack` | 1.2.4 |

This was a lockfile dependency audit; the optional multi-game application was
not scaffolded or functionally tested. The guide now pins these direct versions;
audit and commit the generated lockfile in each actual project.

## Upstream build findings and consumer remediation

The API's **own committed pnpm-lock.yaml** reports **42 findings: 24 high,
16 moderate, 2 low** (154 dependency entries). These are findings in upstream
build dependencies, not evidence of 42 bugs in the API's own code.
The previous Git installation ran `prepare`, installing those build tools.

**Remediation in this repo:** install the official prebuilt npm release
`knowledgeworker-embedded-asset-api@4.1.0` instead of the Git dependency.
It contains compiled files and no install/prepare lifecycle scripts. Thus the
consumer no longer installs or executes the upstream build graph.
The final consumer dependency audit has **0 known findings**.

Verification performed before switching:

- The downloaded npm tarball matched the registry's SHA-512 integrity metadata.
- Its `dist/index.js` and all seven `.d.ts` files were byte-for-byte identical
  to the files built from pinned GitHub commit
  `2cd242908418902f4534ab3d0356df5da2a7c69f`.
- Build, ZIP integrity, and browser fallback behavior were rechecked.
- A fresh, frozen install with a separate empty dependency store verifies that
  no cached Git build is needed.

Upstream's lockfile remains unchanged and needs maintenance by chemmedia.
The prebuilt release was itself produced upstream; this installation change
removes the vulnerable build step from our workflow, not the historical build
risk or all possible flaws in bundled code. No audit findings were suppressed.

The following historical upstream findings are retained for traceability:

| Upstream build package | Findings | Advisories |
| --- | --- | --- |
| `@isaacs/brace-expansion` | 1 | [GHSA-7h2j-956f-4vf2](https://github.com/advisories/GHSA-7h2j-956f-4vf2) |
| `ajv` | 1 | [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) |
| `brace-expansion` | 7 | [GHSA-f886-m6hf-6m8v](https://github.com/advisories/GHSA-f886-m6hf-6m8v), [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp), [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg), [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895), [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr), [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7), [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) |
| `diff` | 1 | [GHSA-73rr-hh4g-fpgx](https://github.com/advisories/GHSA-73rr-hh4g-fpgx) |
| `lodash` | 2 | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc), [GHSA-xxjr-mmjv-4gpg](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) |
| `minimatch` | 7 | [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26), [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26), [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj), [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj), [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74), [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74), [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) |
| `nanoid` | 3 | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv), [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8), [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) |
| `picomatch` | 2 | [GHSA-3v7f-55p6-f55p](https://github.com/advisories/GHSA-3v7f-55p6-f55p), [GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) |
| `postcss` | 4 | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93), [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q), [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) |
| `rollup` | 1 | [GHSA-mw96-cpmx-2vgc](https://github.com/advisories/GHSA-mw96-cpmx-2vgc) |
| `source-map-js` | 1 | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) |
| `vite` | 10 | [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9), [GHSA-v2wj-q39q-566r](https://github.com/advisories/GHSA-v2wj-q39q-566r), [GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583), [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3), [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv), [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw), [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm), [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw), [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22), [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) |

## Validation

- Frozen-lockfile reinstall and production build completed successfully.
- `asset.zip` CRC and expected root files verified independently with Python zipfile.
- ZIP fixtures: nested folders, empty folders, Unicode names/content, binary
  byte-for-byte comparison; missing dist, symlink, and output I/O failure cases.
- Chromium exercised API import, local fallback, JSON loading, saved visit state
  across reload, and absence of uncaught errors against dev and built preview.
- Both tool packages carry identical ZIP and pnpm workspace templates.
- Actual Knowledgeworker LMS initialization/host interactions were not tested.

Audit results are advisory-database checks, not a source-code security review.
Git source, bundled code, unpublished issues, and upstream build tooling require
separate assessment. Rerun the audit when dependency versions or advisories change.

## Ongoing agent requirements

Both skill packages now ship identical `resources/package.json`,
`resources/pnpm-lock.yaml` and `resources/pnpm-workspace.yaml` for a reproducible
base installation. The base graph without browser test tooling audited clean
(45 audit dependency entries), built successfully and passed a frozen reinstall.
`pnpm outdated` reported no available updates for this baseline on the check date.

Every setup/refresh MUST run `pnpm audit --audit-level=low` and `pnpm outdated`,
inspect deprecation/runtime/peer/lifecycle warnings, apply reviewed upgrades using
`pnpm update`, and repeat audit, build, ZIP and browser checks after each upgrade.
Exact pins need an explicit reviewed version; blindly running `pnpm update`
does not refresh them. Unresolved issues must be reported, not suppressed.
See the mandatory dependency review in each skill's `docs/operations.md`.
