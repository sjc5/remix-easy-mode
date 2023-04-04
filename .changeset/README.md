# NPM Package Starter

## Setup

First, clone this repo, and push it to a fresh public GitHub repo (ideally with a name matching your npm package).

Then, in that new GitHub repo, you'll need to:

1. Go to repo --> Settings --> sidebar --> Actions --> General --> Workflow Permission:

   - [x] Read and Write Permissions
   - [x] Allow GitHub Actions to create and approve Pull Requests

2. Go to repo --> Settings --> sidebar --> Secrets and Variables --> Actions --> Repository secrets:
   - Add a secret called `NPM_TOKEN`, which you can get from your npm account

## Usage

Then when you actually make a change you want to publish, run:

```bash
pnpm changeset
```

And choose the appropriate version bump according to semver (major, minor, or patch). Edit the auto-generated markdown file inside the `.changeset` folder if you want.

When you merge a the changeset into your main branch, a PR will be opened automatically that (1) cleans up the changeset, and (2) increments your version number. When you merge _that_ PR into main, your new code will be published to npm under the new version number.
