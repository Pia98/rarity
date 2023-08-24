import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fader } from './route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [ // <-- add your animations here
     fader,
    // slider,
    // transformer,
    //stepper
  ]
})

export class AppComponent {
  title = 'last-chance-frontend';

  prepareRoute(outlet: RouterOutlet) {
    return outlet;
  }
}
