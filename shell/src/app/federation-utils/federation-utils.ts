import { LoadRemoteModuleOptions } from '../interfaces/module-federation.interfaces';
import axios from 'axios';

const dshs = '*******************************************'

type Scope = unknown;
type Factory = () => any;

type Container = {
    init(shareScope: Scope, initScope?: Scope): Promise<void>;
    get(module: string, getScope?: Scope): Promise<Factory>;
};


const createContainer = (name: string): Container => {
  // @ts-ignore
  const container = window[name] as Container;
  return container
} ;

declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: Scope, plugin: Scope };
declare const __webpack_require__: any;
const moduleMap: any = {};

export function loadRemoteEntry(remoteEntry: string): Promise<boolean> {
    return new Promise<any>((resolve, reject) => {
        if (moduleMap[remoteEntry]) {
            resolve(moduleMap[remoteEntry]);
            return;
        }

        const script = document.createElement('script');
        script.src = remoteEntry;

        script.onerror = reject;

        script.onload = () => {
            moduleMap[remoteEntry] = true;
            console.log('moduleMap', moduleMap);
            resolve(moduleMap[remoteEntry]); // window is the global namespace
          };

        document.body.appendChild(script);
    });
}

async function lookupExposedRemote<T>(
    remoteName: string,
    exposedModule: string
): Promise<T> {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');
  const container = createContainer(remoteName);
  checkContainer(container);
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(exposedModule);
  console.log('-------------------------------------------------')
  console.log(factory.toString());
  console.log('-------------------------------------------------')
  return factory() as T;
}

export async function loadRemoteModule(
    options: LoadRemoteModuleOptions
): Promise<any> {
    // console.log(await loadWebpackContainer(options.remoteEntry));
    // await loadRemoteEntry(options.remoteEntry);
    return await lookupExposedRemote<any>(
        options.remoteName,
        options.exposedModule
    );
}

async function loadWebpackContainer(remote: string) {
  const req = await axios.get(remote)
  if (req.status === 200) {
    return req.data;
  } else {
    throw new Error('Webpack was not loaded!');
  }
}

function checkContainer(container: Container) {
  if (!container) {console.log(`%c${dshs} \n Container with script was not defined \n${dshs}`, 'color: tomato')}
  if (container) { console.log (`%c${dshs} \n Container with script was defined \n${dshs}`, 'color: green') }
}
