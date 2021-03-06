import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import * as THREE from 'three';
import { RawShaderMaterial } from 'three';
import { TouchTexture } from './scripts/touch-texture';
import { Shaders } from './scripts/shaders';
import { RxjsTween } from './tween/rxjs-tween';

@Component({
  selector: 'lib-image-as-particles',
  template: `
    <div #container [style.background-color]="backgroundColor"
                      [style.touch-action]="touchAction"
                      [style.justify-content]="justifyContent"
                      [style.align-items]="alignItems"></div>
  `,
  styles: [`
    div{
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background-color: #222;
      touch-action: none;
    }
  `]
})
export class NgImageAsParticlesComponent implements OnInit, AfterViewInit, OnDestroy {

  // Declare variables
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private texture: THREE.Texture;
  private object3D: THREE.Mesh;
  private container: THREE.Object3D;
  private hitArea: THREE.Mesh;
  private width: number;
  private height: number;
  private numPoints: number;
  private touch: TouchTexture;
  private mouse: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  private stopAnimation: boolean;
  private _imageUrl: string;
  private _imageChanging: boolean;
  justifyContent: string;
  alignItems: string;

  // Angular Inputs
  @Input()
  set imageUrl(imageUrl: string) {
    this._imageUrl = imageUrl;
    if(this._imageChanging == true) return;
    if (this.object3D != null) {
      this._imageChanging = true;
      this.triggerImageChange();
    }
  }
  get imageUrl(): string { return this._imageUrl; }
  @Input() backgroundColor: string;
  @Input() touchAction: string;
  @Input() imageWidth: string;
  @Input() imageHeight: string;
  @Input()
  set horizontalAlignment(horizontalAlignment: string) {
    switch (horizontalAlignment) {
      case 'start':
        this.justifyContent = 'flex-start';
        break;
      case 'center':
        this.justifyContent = 'center';
        break;
      case 'end':
        this.justifyContent = 'flex-end';
        break;
      default:
        this.justifyContent = null;
        break;
    }
  }
  get horizontalAlignment(): string { return this.justifyContent; }
  @Input()
  set verticalAlignment(verticalAlignment: string) {
    switch (verticalAlignment) {
      case 'top':
        this.alignItems = 'flex-start';
        break;
      case 'center':
        this.alignItems = 'center';
        break;
      case 'bottom':
        this.alignItems = 'flex-end';
        break;
      default:
        this.alignItems = null;
        break;
    }
  }
  get verticalAlignment(): string { return this.alignItems; }

  @ViewChild('container') canvasRef: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (this._imageUrl == null || this._imageUrl === '') { return; }
    this.initScene();
    this.initParticles(this._imageUrl);
    this.renderer.setSize(this.canvasRef.nativeElement.clientWidth - 1, this.canvasRef.nativeElement.clientHeight);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);
    this.canvasRef.nativeElement.children[0].addEventListener('mousemove', ev => { this.onMouseMove(ev); }, false);
    this.canvasRef.nativeElement.children[0].addEventListener('touchmove', ev => { this.onTouchMove(ev); }, false);

    this.animate();
  }

  ngOnDestroy() {
    // remove event listeners
    this.canvasRef.nativeElement.removeEventListener('mousemove', ev => { this.onMouseMove(ev); }, false);
    this.canvasRef.nativeElement.removeEventListener('touchmove', ev => { this.onTouchMove(ev); }, false);
  }

  initScene(): void {
    // scene
    this.scene = new THREE.Scene();
    // camera
    this.camera = new THREE.PerspectiveCamera(50,
      this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight,
      1, 10000);
    this.camera.position.z = 300;
    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // clock
    this.clock = new THREE.Clock(true);
    // mouse
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
  }

  initParticles(url: string): void {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      this.texture = texture;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.format = THREE.RGBFormat;

      this.width = texture.image.width;
      this.height = texture.image.height;

      this.initPoints(true);
      this.initHitArea();
      this.initTouch();
      this.resize();
      this.show();
    });
  }

  initPoints(discard: boolean) {
    this.numPoints = this.width * this.height;

    let numVisible = this.numPoints;
    let threshold = 0;
    let originalColors;

    if (discard) {
      // discard pixels darker than threshold #22
      numVisible = 0;
      threshold = 34;

      const img = this.texture.image;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = this.width;
      canvas.height = this.height;
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0, this.width, this.height * -1);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      originalColors = Float32Array.from(imgData.data);

      for (let i = 0; i < this.numPoints; i++) {
        if (originalColors[i * 4 + 0] > threshold) { numVisible++; }
      }
    }

    const uniforms = {
      uTime: { value: 0 },
      uRandom: { value: 1.0 },
      uDepth: { value: 2.0 },
      uSize: { value: 0.0 },
      uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
      uTexture: { value: this.texture },
      uTouch: { value: null },
    };

    const shaders = new Shaders();
    const material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader: shaders.particleVertex,
      fragmentShader: shaders.particleFragment,
      depthTest: false,
      transparent: true,
      // blending: THREE.AdditiveBlending
    });

    const geometry = new THREE.InstancedBufferGeometry();

    // positions
    const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);
    geometry.setAttribute('position', positions);

    // uvs
    const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXY(0, 0.0, 0.0);
    uvs.setXY(1, 1.0, 0.0);
    uvs.setXY(2, 0.0, 1.0);
    uvs.setXY(3, 1.0, 1.0);
    geometry.setAttribute('uv', uvs);

    // index
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

    const indices = new Uint16Array(numVisible);
    const offsets = new Float32Array(numVisible * 3);
    const angles = new Float32Array(numVisible);

    for (let i = 0, j = 0; i < this.numPoints; i++) {
      if (discard && originalColors[i * 4 + 0] <= threshold) { continue; }

      offsets[j * 3 + 0] = i % this.width;
      offsets[j * 3 + 1] = Math.floor(i / this.width);

      indices[j] = i;

      angles[j] = Math.random() * Math.PI;

      j++;
    }

    geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
    geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
    geometry.setAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));

    this.object3D = new THREE.Mesh(geometry, material);
    this.container = new THREE.Object3D();
    this.container.add(this.object3D);
    this.scene.add(this.container);
  }

  initTouch(): void {
    // create only once
    if (!this.touch) { this.touch = new TouchTexture(); }
    (this.object3D.material as RawShaderMaterial).uniforms.uTouch.value = this.touch.texture;
  }

  initHitArea() {
    const geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, depthTest: false });
    material.visible = false;
    this.hitArea = new THREE.Mesh(geometry, material);
    this.object3D.add(this.hitArea);
  }

  public update(delta) {
    if (!this.object3D) { return; }
    if (this.touch) { this.touch.update(); }

    (this.object3D.material as RawShaderMaterial).uniforms.uTime.value += delta;
  }

  show(time: number = 1000): void {
    // Tween in
    RxjsTween.createTween(RxjsTween.easeInOutQuad, [0.5, 0.0, 70.0], [1.5, 2.0, 4.0], time).subscribe(val => {
      (this.object3D.material as RawShaderMaterial).uniforms.uSize.value = val[0];
      (this.object3D.material as RawShaderMaterial).uniforms.uRandom.value = val[1];
      (this.object3D.material as RawShaderMaterial).uniforms.uDepth.value = val[2];
    }, () => {}, () => {
      this._imageChanging = false;
    });
  }

  triggerImageChange(time: number = 1000): void {
    const uSizeStart = (this.object3D.material as RawShaderMaterial).uniforms.uSize.value;
    const uRandomStart = (this.object3D.material as RawShaderMaterial).uniforms.uRandom.value;
    const uDepth = (this.object3D.material as RawShaderMaterial).uniforms.uDepth.value;
    // Tween out
    RxjsTween.createTween(RxjsTween.easeInOutQuad, [uSizeStart, uRandomStart, uDepth], [0.0, 5.0, -20.0], time).subscribe(val => {
      (this.object3D.material as RawShaderMaterial).uniforms.uSize.value = val[0];
      (this.object3D.material as RawShaderMaterial).uniforms.uRandom.value = val[1];
      (this.object3D.material as RawShaderMaterial).uniforms.uDepth.value = val[2];
    }, () => {}, () => {
      this.destroy();
      this.initParticles(this._imageUrl);
      this._imageChanging = false;
    });
  }

  destroy() {
    if (!this.object3D) { return; }

    this.object3D.parent.remove(this.object3D);
    this.object3D.geometry.dispose();
    (this.object3D.material as RawShaderMaterial).dispose();
    this.object3D = null;

    if (!this.hitArea) { return; }

    this.hitArea.parent.remove(this.hitArea);
    this.hitArea.geometry.dispose();
    (this.hitArea.material as RawShaderMaterial).dispose();
    this.hitArea = null;
  }

  private animate() {
    window.requestAnimationFrame(() => this.animate());
    if (this.stopAnimation !== true) {
      const delta = this.clock.getDelta();
      this.update(delta);

      this.renderer.render(this.scene, this.camera);
    }
  }

  onMouseMove(event: MouseEvent): void {
    const offsetLeft = this.canvasRef.nativeElement.offsetLeft + this.canvasRef.nativeElement.children[0].offsetLeft;
    const offsetTop = this.canvasRef.nativeElement.offsetTop + this.canvasRef.nativeElement.children[0].offsetTop;
    this.mouse.x = (event.clientX - offsetLeft + window.scrollX) / this.canvasRef.nativeElement.children[0].clientWidth * 2 - 1;
    this.mouse.y = - (event.clientY - offsetTop + window.scrollY) / this.canvasRef.nativeElement.children[0].clientHeight * 2 + 1;
    // console.info('raw: x= ' + event.clientX + ' , y= ' + event.clientY);
    // console.info('normalized: x= ' + this.mouse.x + ' , y= ' + this.mouse.y);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this.hitArea === undefined) { return; }
    const intersects = this.raycaster.intersectObject(this.hitArea);
    if (intersects.length > 0) {
      if (this.touch) { this.touch.addTouch(intersects[0].uv.x, intersects[0].uv.y); }
    }
  }

  onTouchMove(event: TouchEvent): void {
    const offsetLeft = this.canvasRef.nativeElement.offsetLeft + this.canvasRef.nativeElement.children[0].offsetLeft;
    const offsetTop = this.canvasRef.nativeElement.offsetTop + this.canvasRef.nativeElement.children[0].offsetTop;
    this.mouse.x = (event.touches[0].clientX - offsetLeft + window.scrollX) / this.canvasRef.nativeElement.children[0].clientWidth * 2 - 1;
    this.mouse.y = - (event.touches[0].clientY - offsetTop + window.scrollY) / this.canvasRef.nativeElement.children[0].clientHeight * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.hitArea);
    if (intersects.length > 0) {
      if (this.touch) { this.touch.addTouch(intersects[0].uv.x, intersects[0].uv.y); }
    }
  }

  @HostListener('window:resize') resize(): void {
    if (this.height !== undefined) {
      this.camera.aspect = this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
      this.camera.updateProjectionMatrix();
      const fovHeight = 2 * Math.tan(this.camera.fov * Math.PI / 180 / 2) * this.camera.position.z;
      const scale = fovHeight / this.height;
      this.object3D.scale.set(scale, scale, 1);
      // this.hitArea.scale.set(scale, scale, 1);
      if (this.renderer !== undefined) {
        const width = this.imageWidth == null ? this.canvasRef.nativeElement.clientWidth :
            this.distanceAsNumber(this.imageWidth, this.canvasRef.nativeElement.clientWidth);
        const height = this.imageHeight == null ? this.canvasRef.nativeElement.clientHeight :
            this.distanceAsNumber(this.imageHeight, this.canvasRef.nativeElement.clientHeight);
        this.renderer.setSize(width, height);
      }
    }
  }

  @HostListener('window:scroll') onScroll(): void {
    if ((window.pageYOffset + window.innerHeight) < this.canvasRef.nativeElement.offsetTop ||
          window.pageYOffset > (this.canvasRef.nativeElement.clientHeight + this.canvasRef.nativeElement.offsetTop) ) {
      this.stopAnimation = true;
    } else {
      this.stopAnimation = false;
    }
  }

  private distanceAsNumber(distance: string, parentDistance: number): number {
    let returnVal = 0;
    if (distance.includes('px')) {
      returnVal = Number.parseInt(distance.replace('px', ''), 10);
    } else if (distance.includes('%')) {
      returnVal = Number.parseInt(distance.replace('%', ''), 10) / 100 * parentDistance;
    } else {
      returnVal = Number.parseInt(distance, 10);
    }
    return returnVal;
  }
}
