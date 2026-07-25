import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Storyloom backend listening on :${config.port} (${config.env})`);
});
