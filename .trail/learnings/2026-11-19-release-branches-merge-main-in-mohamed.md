# Release branches: merge main in, resolve in favor of branch intent

## Decided
This repo squash-merges release/* into main, so main and develop histories diverge and every release branch cut from develop shows ~300 files of noise against main — but only files with *real content* differences conflict. Convention that worked: `git merge origin/main` into the release branch, resolve conflicts in favor of the branch side (it carries the newer intent from develop), then run the full bar (tsc, lint, bun test, next build) before pushing.

## Watch out
GitHub's `mergeStateStatus: BLOCKED` with all checks green means branch protection is waiting on the human review approval — not a failed check. Also: reviewers (Codex) flag issues in *any* file the release diff carries to production, not just the PR's own files; a Sentry PR may surface integration-form bugs that deserve fixing on the same branch.
