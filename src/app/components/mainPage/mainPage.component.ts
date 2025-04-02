import { Component } from '@angular/core';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { BokComponent } from '@eo4geo/ngx-bok-visualization';
import { AnnotateDocumentComponent } from '../annotate-document/annotate-document.component';

@Component({
  standalone: true,
  selector: 'main-page',
  templateUrl: './mainPage.component.html',
  styleUrls: ['./mainPage.component.css'],
  imports: [
    UploadDocumentComponent,
    AnnotateDocumentComponent,
    BokComponent
  ],
})
export class MainPageComponent {
  concept: string = 'GIST'
}
