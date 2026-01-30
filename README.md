# QuitBuddy Website

Static marketing site for **QuitBuddy — Customize Cmd+Q**. This repository is designed for GitHub Pages, so the contents of `main` (or `gh-pages`) can be published directly without a build step.

## Local preview

Open `index.html` directly in a browser or serve the folder with any static server, e.g.

```bash
python3 -m http.server 4000
```

Then visit <http://localhost:4000>.

## Deploy to GitHub Pages

1. Commit all changes and push to GitHub.
2. In the repository settings on GitHub, enable **Pages**.
3. Choose the deployment source:
   - **Deploy from a branch**: select `main` (or a `gh-pages` branch) and the `/ (root)` folder.
4. Save. GitHub Pages will build automatically and serve the site.

The `Privacy Policy` link already targets `privacy.html`, so once Pages is live you can share `https://<username>.github.io/QuitBuddy-Website/privacy.html` (or your custom domain) in App Store Connect.
