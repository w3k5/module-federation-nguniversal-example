import { CustomResourceLoader } from '@nguniversal/common/clover/server/src/custom-resource-loader';
import { createFetch } from '@angular-architects/module-federation/nguniversal';
import { Engine } from '@nguniversal/common/clover/server';
import * as express from 'express';
import { join } from 'path';
import { format } from 'url';
import { readFileSync } from 'fs';
import { LoadRemoteModuleOptions } from '@angular-architects/module-federation';
import axios from 'axios';
import requireFromString from 'require-from-string';
const domino = require('domino');

export async function loadRemoteComponent(options: Omit<LoadRemoteModuleOptions, 'exposedModule'>) {
    const request: string = await axios.get('http://localhost:3005/plugins/frontend/src_app_marketplace_components_ais-components_first-block_first-block_component_ts-es5.js');
    const component = requireFromString(request);
}


const template = readFileSync(
  join(join(process.cwd(), 'dist/ssr-test/browser'), 'index.html')
).toString();
const window = domino.createWindow(template);
global.window = window;
global.document = window.document;

const PORT = 5000;
const HOST = `localhost:${PORT}`;
const DIST = join(__dirname, '../browser');

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
