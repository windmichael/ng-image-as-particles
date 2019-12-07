import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ng-image-as-particles-showcase';
  imageUrls: string[] = ['assets/dog.png', 'assets/pexels-photo.png', 'assets/tiger.png'];
  selectedUrl: string;

  ngOnInit(){
    this.selectedUrl = this.imageUrls[0];
  }

  selectImage(selectedImageUrl: string){
    this.selectedUrl = selectedImageUrl;
  }
}
