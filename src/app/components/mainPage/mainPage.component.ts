import { Component, OnDestroy, OnInit } from '@angular/core';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { BokComponent } from '@eo4geo/ngx-bok-visualization';
import { AnnotateDocumentComponent } from '../annotate-document/annotate-document.component';
import { PDFDocument } from 'pdf-lib';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FileService } from '../../services/file.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { SessionService } from '../../services/session.service';
import { DocumentInformationComponent } from "../document-information/document-information.component";

@Component({
  standalone: true,
  selector: 'main-page',
  templateUrl: './mainPage.component.html',
  styleUrls: ['./mainPage.component.css'],
  imports: [
    UploadDocumentComponent,
    AnnotateDocumentComponent,
    BokComponent,
    CommonModule,
    AccordionModule,
    DocumentInformationComponent,
    ButtonModule
],
})
export class MainPageComponent implements OnInit, OnDestroy {
  concept: string = 'GIST'
  logged: boolean = false;
  pdfDoc: PDFDocument | null = null;

  saveName: string = '';
  saveDescription: string = '';

  private bokRelations: string[] = [];
  private fileName: string = '';

  private bokRelationsSubscription!: Subscription;
  private pdfDocSubscription!: Subscription;
  private fileNameSubscription!: Subscription;
  private loggedSubscription!: Subscription;

  constructor(private fileService: FileService, private sessionService: SessionService) {}

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
    this.loggedSubscription = this.sessionService.logged$.subscribe(newValue => {
      this.logged = newValue;
    })
  }

  ngOnDestroy() {
    this.pdfDocSubscription.unsubscribe();
    this.bokRelationsSubscription.unsubscribe();
    this.fileNameSubscription.unsubscribe();
    this.loggedSubscription.unsubscribe();
  }

  updateSaveName(newValue: string) {
    this.saveName = newValue;
  }

  updateSaveDescription(newValue: string) {
    this.saveDescription = newValue;
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
