import {
    trigger,
    transition,
    style,
    query,
    animate
} from '@angular/animations';

export const fader =
    trigger('routeAnimations', [
        transition('* <=> *', [
            query(':leave', [
                style({
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    opacity: 0,
                    transform: 'scale(0) translateY(100%)',
                })
            ], {optional: true}),
            // Animate the new page in
            query(':enter', [
                animate('1200ms ease', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
            ], {optional: true})
        ]),
    ]);