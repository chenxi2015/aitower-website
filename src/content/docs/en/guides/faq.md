---
title: FAQ & Troubleshooting
description: Answers on local-first vault safety, file format compatibility, and release verification.
section: guides
order: 1
---

## Will aitower modify my existing Obsidian files in the background?

No hidden database mutations occur. aitower reads and writes your Obsidian vault directly, updating files only when you edit, save, create notes, or insert exported diagrams. Deletions always go to the system trash.

## Can I open my existing .canvas and .excalidraw files?

Yes. Notes and Studio natively support `.md`, `[[Wikilink]]` syntax, `.canvas`, and `.excalidraw` files within the same workspace.

## Where do installers come from and how are updates delivered?

All installers are built by GitHub Actions and published on the public [chenxi2015/aitower-releases](https://github.com/chenxi2015/aitower-releases/releases) repository along with checksum files. The desktop client also includes a built-in self-updater.

## Why "human-crafted hybrid" instead of full auto-generation?

Long-form writing and technical diagrams carry weight because they reflect real human judgment and trade-offs. AI accelerates retrieval, outlining, and initial board layout—you keep editorial control and visual taste.
