import { Component } from '@angular/core';
import { LoadRemoteModuleOptions } from './interfaces/module-federation.interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ssr-test';
  configuration: LoadRemoteModuleOptions = {
    remoteEntry: 'http://localhost:3000/remoteEntry.js',
    remoteName: 'remote',
    exposedModule: 'SharedComponent',
  }
}
