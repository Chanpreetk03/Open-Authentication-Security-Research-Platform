# Local Development

The current prototype uses Go for the API and React/TypeScript for the web client. Start the API from `backend/`:

```sh
go run ./cmd/server
```

Start the web app from `web/` in a second terminal:

```sh
npm install
npm run dev
```

The API binds to `127.0.0.1:8080`; Vite serves the UI on port 5173 and proxies `/api` to the API. Current flows are synthetic and do not contact real identity providers.

The planned scenario runner is not implemented yet. Do not run vulnerable targets on a public interface. Before adding container-backed labs, document supported runtime/platform prerequisites, network isolation, resource limits, cleanup, and reset behavior.
