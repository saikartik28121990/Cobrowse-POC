import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app';

import { SignaturePadModule } from 'ngx-signaturepad';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(SignaturePadModule)
  ]
}).catch(err => console.error(err));
