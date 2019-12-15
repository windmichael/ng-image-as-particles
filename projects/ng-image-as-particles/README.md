# Image As Particles
Angular library to show images as particles with using three.js

This library is based on the great work and code of [Bruno Imbrizi](https://github.com/brunoimbrizi/) and brought to Angular.

A description and a tutorial how the project was created can be found on https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/ 

![](example.gif)

## Demo

[Stackblitz Showcase](https://stackblitz.com/github/windmichael/ng-image-as-particles)

`ng-image-as-particles` used on a homepage on welcome page: https://lenny-the-samoyed.firebaseapp.com/


## Dependencies
* [Angular](https://angular.io) (*requires* Angular 8+ )
* [three.js](https://threejs.org) (*requires* threejs 0.108.0 )

## Installation
#### 1. Install version 0.108.0 of `three.js` via npm:
```
npm install three@0.108.0
```

#### 2. Install `ng-image-as-particles` via npm:
```
npm install ng-image-as-particles
```
Once installed you need to import the main module:
```typescript
import { NgImageAsParticlesModule } from 'ng-image-as-particles';

@NgModule({
  declarations: [AppComponent, ...],
  imports: [NgImageAsParticlesModule],  
  bootstrap: [AppComponent]
})
export class AppModule {
}
```


## Usage
```html
<lib-image-as-particles [imageUrl]="selectedUrl" 
                        backgroundColor="#222" 
                        touchAction="none">
</lib-image-as-particles>
```

## API
| Name  | Default | Description |
| ----- | ------- | ----------- |
| imageUrl | null | URL to the image |
| backgroundColor | "#222" | The background-color CSS property sets the background color of an element. ([background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color)) |
| touchAction | "none" | The touch-action CSS property sets how an element's region can be manipulated by a touchscreen user. ([touchAction](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)) |
