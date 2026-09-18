import { createApp } from "./app.js";
import { loadStore } from "./store/fileStore.js";

const port = Number(process.env.PORT ?? 4000);

await loadStore();
const app = createApp();

app.listen(port, () => {
  console.log(`HULUM API listening on http://localhost:${port}`);
});
