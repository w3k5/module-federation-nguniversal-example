import { NgModule } from '@angular/core';

import { AngularWrapperComponent } from './federation-utils/mf-wrapper.component';

@NgModule({
  exports: [AngularWrapperComponent],
  declarations: [AngularWrapperComponent],
})
export class ModuleFederationModule { }
