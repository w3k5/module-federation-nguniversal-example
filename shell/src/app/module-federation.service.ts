import { Injectable } from '@angular/core';
import { LoadRemoteModuleOptions } from './interfaces/module-federation.interfaces';
const dshs = '*******************************************';

type Scope = unknown;
type Factory = () => any;

type Container = {
  init(shareScope: Scope, initScope?: Scope): Promise<void>;
  get(module: string, getScope?: Scope): Promise<Factory>;
};

declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: Scope; plugin: Scope };
declare const __webpack_require__: any;

@Injectable({ providedIn: 'root' })
export class ModuleFederationService {
  moduleMap: any = {};

  createContainer(name: string): Container {
    // @ts-ignore
    const container = window[name] as Container;
    return container;
  }

  loadRemoteEntry(remoteEntry: string): Promise<boolean> {
    return new Promise<any>((resolve, reject) => {
      if (this.moduleMap[remoteEntry]) {
        resolve(this.moduleMap[remoteEntry]);
        return;
      }

      const script = document.createElement('script');
      script.src = remoteEntry;

      script.onerror = reject;

      script.onload = () => {
        this.moduleMap[remoteEntry] = true;
        console.log('moduleMap', this.moduleMap);
        resolve(this.moduleMap[remoteEntry]); // window is the global namespace
      };

      document.body.appendChild(script);
    });
  }

  checkContainer(container: Container) {
    if (!container) {
      console.log(
        `%c${dshs} \n Container with script was not defined \n${dshs}`,
        'color: tomato'
      );
    }
    if (container) {
      console.log(
        `%c${dshs} \n Container with script was defined \n${dshs}`,
        'color: green'
      );
    }
  }

  async lookupExposedRemote<T>(
    remoteName: string,
    exposedModule: string
  ): Promise<T> {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__('default');
    const container = this.createContainer(remoteName);
    this.checkContainer(container);
    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get(exposedModule);
    console.log('-------------------------------------------------');
    console.log(factory.toString());
    console.log('-------------------------------------------------');
    return factory() as T;
  }

  async loadRemoteModule(options: LoadRemoteModuleOptions): Promise<any> {
    // await loadRemoteEntry(options.remoteEntry);
    return await this.lookupExposedRemote<any>(
      options.remoteName,
      options.exposedModule
    );
  }
}
