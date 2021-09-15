import { LoadRemoteModuleOptions } from '../interfaces/module-federation.interfaces';
import axios from 'axios';

type Scope = unknown;
type Factory = () => any;

type Container = {
    init(shareScope: Scope, initScope?: Scope): void;
    get(module: string, getScope?: Scope): Promise<Factory>;
};


const createContainer = (name: string): Container => {
  // @ts-ignore
  const container = window[name] as Container;
  return container
} ;

declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: Scope, plugin: Scope };

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
  // @ts-ignore
  // @ts-ignore
  const container = createContainer(remoteName);
  if (!container) {throw new Error('Container with script is not defined')}
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(exposedModule);
  const Module = factory();
  return Module as T;
}

export async function loadRemoteModule(
    options: LoadRemoteModuleOptions
): Promise<any> {
    await loadRemoteEntry(options.remoteEntry);
    return await lookupExposedRemote<any>(
        options.remoteName,
        options.exposedModule
    );
}

// export async function loadRemoteComponent(options: Omit<LoadRemoteModuleOptions, 'exposedModule'>) {
//   const request: string = await axios.get('http://localhost:3005/plugins/frontend/src_app_marketplace_components_ais-components_first-block_first-block_component_ts-es5.js');
//   const component = requireFromString(request);
// }
