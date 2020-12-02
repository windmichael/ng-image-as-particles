import { Observable, Observer } from 'rxjs';

export module RxjsTween {
    /**
     * Creates an observable that emits samples from an easing function on every animation frame
     * for a duration `d` ms.
     *
     * The first value will be emitted on the next animation frame,
     * and is the value of the easing function at `t = 0`.
     * The final value is guaranteed to be the easing function at `t = d`.
     * The observable completes one frame after the final value was emitted.
     * @param easingFunction the easing fuction to sample
     * @param b beginning value and 2nd parameter of the easing function
     * @param c change in value (or end value) and 3rd parameter of the easing function
     * @param d total duration of the tween in ms and 4th parameter of the easing function
     * @param s 5th parameter of the easing function (optional)
     */
    export function createTween(easingFunction: (t: number, b: number, _c: number, d: number, s?: number) => number,
        b: number[], c: number[], d: number, s?: number): Observable<number[]>;
        export function createTween(easingFunction: (t: number, b: number, _c: number, d: number, s?: number) => number,
        b: number, c: number, d: number, s?: number): Observable<number>;
    export function createTween(easingFunction: (t: number, b: number, _c: number, d: number, s?: number) => number,
        b: any, c: any, d: number, s?: number): Observable<any> {
        return new Observable((observer: Observer<any>) => {
            let startTime: number;
            let id = requestAnimationFrame(function sample(time) {
                startTime = startTime || time;
                const t = time - startTime;
                if (t < d) {
                    if(Array.isArray(b) && Array.isArray(c)){
                        var tweenVals: number[] = new Array<number>();
                        for(var idx = 0; idx < b.length; idx++){
                            tweenVals.push(easingFunction(t, b[idx], c[idx], d, s))
                        }
                        observer.next(tweenVals);
                    }else{
                        observer.next(easingFunction(t, b, c, d, s));
                    }
                    id = requestAnimationFrame(sample);
                } else {
                    if(Array.isArray(b) && Array.isArray(c)){
                        var tweenVals: number[] = new Array<number>();
                        for(var idx = 0; idx < b.length; idx++){
                            tweenVals.push(easingFunction(t, b[idx], c[idx], d, s))
                        }
                        observer.next(tweenVals);
                    }else{
                        observer.next(easingFunction(t, b, c, d, s));
                    }
                    id = requestAnimationFrame(function () {
                        return observer.complete();
                    });
                }
            });
            return function () {
                if (id) {
                    cancelAnimationFrame(id);
                }
            };
        });
    }

    export function linear(t: number, b: number, _c: number, d: number) {
        var c = _c - b;
        return c * t / d + b;
    }

    export function easeInOutQuad(t: number, b: number, _c: number, d: number) {
        var c = _c - b;
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        } else {
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    }
}
