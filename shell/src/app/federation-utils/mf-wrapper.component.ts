import { ModuleFederationService } from './module-federation.service';

import {AfterContentInit, Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute, Data} from '@angular/router';
import {take} from 'rxjs/operators';
import { LoadRemoteModuleOptions } from '../interfaces/module-federation.interfaces';

@Component({
  selector: 'angular-wrapper',
  template: '<div class=\'angular-wrapper\'><ng-container #container></ng-container></div>'
})
export class AngularWrapperComponent implements AfterContentInit {
  @Input() configuration!: LoadRemoteModuleOptions;

  @ViewChild('container', {read: ViewContainerRef}) container!: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private route: ActivatedRoute,
              private moduleFederationService: ModuleFederationService,
  ) {
  }

  async ngAfterContentInit(): Promise<void> {
    if (!this.configuration) {
      this.route.data
        .pipe(take(1))
        .subscribe(async (data: Data) => {
          await this.renderComponent(data.configuration);
        });
    }
    await this.renderComponent(this.configuration);
  }

  private async renderComponent(configuration: LoadRemoteModuleOptions): Promise<void> {
    const component = await this.moduleFederationService.loadRemoteModule({
      remoteEntry: configuration.remoteEntry,
      remoteName: configuration.remoteName,
      exposedModule: configuration.exposedModule
    });

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component[configuration.exposedModule]);
    this.container.clear();

    const componentRef = this.container.createComponent(componentFactory);
    componentRef.changeDetectorRef.detectChanges();
  }
}
