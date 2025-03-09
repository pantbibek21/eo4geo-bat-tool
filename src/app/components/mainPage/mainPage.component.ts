import { Component } from '@angular/core';
import { BokComponent } from '@eo4geo/ngx-bok-visualization';
import { IntroductionComponent } from '../introduction/introduction.component';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { AnnotateDocumentComponent } from '../annotate-document/annotate-document.component';

@Component({
  standalone: true,
  selector: 'main-page',
  templateUrl: './mainPage.component.html',
  styleUrls: ['./mainPage.component.css'],
  imports: [
    BokComponent,
    IntroductionComponent,
    UploadDocumentComponent,
    AnnotateDocumentComponent,
  ],
})
export class MainPageComponent {}
