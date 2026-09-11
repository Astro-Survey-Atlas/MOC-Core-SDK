# MOC-Core-SDK documentation site

This directory contains the static, bilingual documentation page for
`astro-survey-moc-core`. It has no build-time dependencies, CDN assets, backend,
or live API connection.

Serve it from the repository root with:

```bash
python3 -m http.server 8000 --directory site
```

The page is designed for GitHub Pages with the repository's Pages source set to
GitHub Actions. All links to local assets are relative so it also works under a
project subpath.

The algorithm playgrounds are explanatory browser-only calculations. The
Python package and its contracts remain authoritative.
