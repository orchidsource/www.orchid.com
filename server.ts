import "zone.js/dist/zone-node";
import "reflect-metadata";

import {enableProdMode} from "@angular/core";
import {renderModuleFactory} from "@angular/platform-server";

import * as express from "express";
import {readFileSync} from "fs";
import {join} from "path";

enableProdMode();

const app = express();

const PORT        = process.env.PORT || 8080;
const DIST_FOLDER = join(process.cwd(), "dist");

const template = readFileSync(join(DIST_FOLDER, "browser", "index.html"))
                     .toString();

const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require("./dist/server/main");

app.engine("html", (_, options, callback) => {
  renderModuleFactory(AppServerModuleNgFactory, {
    document: template,
    url: options.req.url,
  }).then(html => { callback(null, html); });
});

app.set("view engine", "html");
app.set("views", join(DIST_FOLDER, "browser"));

app.get("*.*", express.static(join(DIST_FOLDER, "browser")));

app.get("*", (req, res) => {
  res.render(join(DIST_FOLDER, "browser", "index.html"), {req});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
})
