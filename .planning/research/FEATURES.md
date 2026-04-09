# FEATURES

## Target Optimization Features
- **Pagination & Infinite Scroll**: Table stakes for any document heavy app. Currently missing, docs might be loading all content upfront.
- **Selective Data Fetching**: Table stakes. Do not `select('*')` on large tables (like dragging `content` string which might be huge) just to render a title list.
- **Query Indexing**: Differentiator. Adding Postgres Indexes to frequently queried fields (`parentId`, `tags`).
