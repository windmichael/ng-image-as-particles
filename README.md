# Image As Particles

<h3>This library been moved to <a href="https://github.com/windmichael/ngx-acuw">ngx-acuw</a>!!!</h3>
</br>
</br>

Angular library to show images as particles with using three.js

This library is based on the great work and code of [Bruno Imbrizi](https://github.com/brunoimbrizi/) and brought to Angular.

A description and a tutorial how the project was created can be found on https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/ 

| Original image  | Image as interactive particles | 
| ------ | ------------------ | 
| ![image](projects/ng-showcase/src/assets/dog.png) | ![](example.gif) | 

## Demo

[Showcase](https://windmichael.github.io/ng-image-as-particles/)

`ng-image-as-particles` used on a homepage on welcome page: https://lenny-the-samoyed.firebaseapp.com/


## Dependencies
* [Angular](https://angular.io) (*requires* Angular 10+ )
* [three.js](https://threejs.org) (*requires* threejs 0.123.0 )

## Installation
#### 1. Install version 0.123.0 of `three.js` via npm:
```
npm install three@0.123.0
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
<lib-image-as-particles [imageUrl]="selectedUrl" touchAction="none"
            imageWidth="90%" imageHeight="90%" backgroundColor="#222222"
            horizontalAlignment="center" verticalAlignment="center">
</lib-image-as-particles>
```

## API
| Name  | Default | Description |
| ----- | ------- | ----------- |
| imageUrl | null | URL to the image |
| backgroundColor | "##222222" | The background-color CSS property sets the background color of an element. ([background-color](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color)) |
| touchAction | "none" | The touch-action CSS property sets how an element's region can be manipulated by a touchscreen user. ([touchAction](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)) |
| imageWidth | "100%" | Width of the generated image in "px" or "%" |
| imageHeight | "100%" | Height of the generated image in "px" or "%" |
| horizontalAlignment | "center" | Possible values: "start", "center", "end" |
| verticalAlignment | "center" | Possible values: "top", "center", "bottom" |

