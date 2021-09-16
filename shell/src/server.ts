import { CustomResourceLoader } from '@nguniversal/common/clover/server/src/custom-resource-loader';
import { createFetch } from '@angular-architects/module-federation/nguniversal';
import { Engine } from '@nguniversal/common/clover/server';
import * as express from 'express';
import { join } from 'path';
import { format } from 'url';
import { readFileSync, existsSync } from 'fs';
import { LoadRemoteModuleOptions } from '@angular-architects/module-federation';
import axios from 'axios';
import requireFromString from 'require-from-string';
const domino = require('domino');
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const PORT = 5000;
const HOST = `localhost:${PORT}`;
const DIST = join(__dirname, '../browser');
const templateDir = join(DIST, 'index.html')
const template = readFileSync(templateDir).toString("utf-8");
const window = new JSDOM(template).window as any;
global.window = window;
global.document = window.document;

const app = express();
app.set('views', DIST);

app.get(
  '*.*',
  express.static(DIST, {
    maxAge: '1y',
    fallthrough: false,
  })
);

// When using localization enable the below to redirect to a default locale
// app.get(/^(\/|\/favicon\.ico)$/, (req, res) => {
//   res.redirect(301, `/en-US${req.originalUrl}`);
// });

// Without mappings, remotes are loaded via HTTP
const mappings = {};

// Monkey Patching Angular Universal for Module Federation
CustomResourceLoader.prototype.fetch = createFetch(mappings);

const ssrEngine = new Engine();

app.get('*', (req, res, next) => {
  ssrEngine
    .render({
      publicPath: DIST,
      url: format({
        protocol: req.protocol,
        host: HOST,
        pathname: req.path,
        query: req.query as Record<string, any>,
      }),
      headers: req.headers,
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

app.listen(PORT, () => {
  console.log(`Node Express server listening on http://${HOST}`);
});
