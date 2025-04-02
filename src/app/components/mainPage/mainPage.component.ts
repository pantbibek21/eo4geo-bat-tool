import { Component, OnDestroy, OnInit } from '@angular/core';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { BokComponent } from '@eo4geo/ngx-bok-visualization';
import { AnnotateDocumentComponent } from '../annotate-document/annotate-document.component';
import { PDFDocument } from 'pdf-lib';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FileService } from '../../services/file.service';

@Component({
  standalone: true,
  selector: 'main-page',
  templateUrl: './mainPage.component.html',
  styleUrls: ['./mainPage.component.css'],
  imports: [
    UploadDocumentComponent,
    AnnotateDocumentComponent,
    BokComponent,
    CommonModule
  ],
})
export class MainPageComponent implements OnInit, OnDestroy {
  concept: string = 'GIST'
  message: string = '';

  private bokRelations: string[] = [];
  private pdfDoc: PDFDocument | null = null;
  private fileName: string = '';

  private bokRelationsSubscription!: Subscription;
  private pdfDocSubscription!: Subscription;
  private fileNameSubscription!: Subscription;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.bokRelationsSubscription = this.fileService.bokConcept$.subscribe(concepts => {
      this.bokRelations = concepts;
    });
    this.pdfDocSubscription = this.fileService.pdfFile$.subscribe(file => {
      this.pdfDoc = file;
    });
    this.fileNameSubscription = this.fileService.fileName$.subscribe(name => {
      this.fileName = name;
    });
  }

  ngOnDestroy() {
    this.pdfDocSubscription.unsubscribe()
    this.bokRelationsSubscription.unsubscribe()
    this.fileNameSubscription.unsubscribe()
  }

  async onDownload() {
    // check if file is available; if available, download, otherwise, set error message telling no file available to downlaod!
    if (this.pdfDoc) {
      // function returns the configured string in RDF format
      const relationsMetadata = this.configureMetaData(this.bokRelations);
      this.pdfDoc?.setTitle(this.fileName);

      // stores the RDF format string holding BoK keys and relations
      this.pdfDoc?.setSubject(relationsMetadata);
      const pdfBytes = await this.pdfDoc.save();

      // set title and download pdf
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = this.fileName;
      link.click();
    } else {
      this.message = 'No file available to download!';

      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }

  // creates a RDF formatted string for BoK keywords
  configureMetaData(relations: string[]) {
    const bokRelations = relations.map(
      (relation) => 'dc:relation eo4geo:' + relation
    );
    const bokRelationsString = bokRelations.join('; ');
    const rdfPrefix = `@prefix dc: <http://purl.org/dc/terms/> . @prefix eo4geo: <http://bok.eo4geo.eu/> . <> ${bokRelationsString} .`;

    return rdfPrefix;
  }
}
