import { Inject, Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Wellyes Lib
import { IStructure } from '@wellyes/spa-shared-lib/interfaces';
import { ENV_TOKEN, IEnvironment } from '@wellyes/spa-shared-lib/environments';

// Utils
import { loadRemoteModule } from './federation-utils/federation-utils';

// Interfaces and Types
import { LoadRemoteModuleOptions } from './interfaces/module-federation.interfaces';

@Injectable({ providedIn: 'root' })
export class ModuleFederationService {
  // ========== Variables =============

  componentNameSet = new Set<string>();

  // ==================================

  // =========== Subjects =============

  remoteLoaded$ = new BehaviorSubject(false);
  remoteComponents$ = new BehaviorSubject<Map<string, Type<unknown>> | null>(
    null
  );

  // ==================================

  collectComponentNames(structures: IStructure[]): Set<string> {
    structures.forEach((structure) => {
      this.componentNameSet.add(structure.item);
      if (structure.content.length) {
        this.collectComponentNames(structure.content);
      }
    });
    return this.componentNameSet;
  }

  prepareMFRequests(
    fileNames: Set<string>,
    api?: string,
  ): LoadRemoteModuleOptions[] {
    const marketApi = this.environment.marketApi ?? api;
    if (!marketApi) throw new Error("Marketplace wasn't initialized!");

    return Array.from(fileNames).map((filename) => ({
      remoteEntry: marketApi,
      remoteName: 'remote',
      exposedModule: `${filename}`,
    }));
  }

  async loadComponentsFromMarketplace(
    requests: LoadRemoteModuleOptions[]
  ): Promise<Map<string, Type<unknown>>> {
    const cmsComponents: Map<string, Type<unknown>> = new Map();
    for (let module of requests) {
      try {
        const loaded = await loadRemoteModule(module);
        console.log('loaded', loaded)
        const exposedModule = loaded[module.exposedModule];
        console.log('exposedModule', exposedModule)
        const _blockName = exposedModule._blockName;
        cmsComponents.set(_blockName, loaded[module.exposedModule]);
        console.log('Success load', module)
      } catch (error) {
        console.error('loadComponentsFromMarketplace', module, error);
      }
    }
    return cmsComponents;
  }

  constructor(@Inject(ENV_TOKEN) private environment: IEnvironment) {}
}
