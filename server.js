/**
 * خادم زُغْرُوطَة للإنتاج
 * يصلح لاستضافة هوستنجر (Node.js / Passenger) وكمان لأي VPS.
 * على هوستنجر: اعملي Setup Node.js App وحطّي الملف ده كـ "Application startup file".
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`✓ زُغْرُوطَة شغّالة على البورت ${port}`);
  });
});
