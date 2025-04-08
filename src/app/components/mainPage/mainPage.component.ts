import { Component, OnDestroy, OnInit } from '@angular/core';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { BokComponent } from '@eo4geo/ngx-bok-visualization';
import { AnnotateDocumentComponent } from '../annotate-document/annotate-document.component';
import { PDFDocument } from 'pdf-lib';
import { CommonModule } from '@angular/common';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { FileService } from '../../services/file.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SessionService } from '../../services/session.service';
import { DocumentInformationComponent } from "../document-information/document-information.component";
import { DocumentForm } from '../../model/documentForm';
import { ToastModule } from 'primeng/toast';
import { MessageService } from "primeng/api";
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';

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
    ButtonModule,
    DividerModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class MainPageComponent implements OnInit, OnDestroy {
  concept: string = 'GIST'
  logged: boolean = false;
  pdfDoc: PDFDocument | null = null;

  formContent: DocumentForm | null = null;

  private bokRelations: string[] = [];
  private fileName: string = '';

  private bokRelationsSubscription!: Subscription;
  private pdfDocSubscription!: Subscription;
  private fileNameSubscription!: Subscription;
  private loggedSubscription!: Subscription;

  constructor(private fileService: FileService, private sessionService: SessionService, private databaseService: DatabaseService, 
              private messageService: MessageService, private router: Router) {}

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
    this.fileService.setPdfFile(null!)
    this.fileService.setFileName('')
    this.fileService.setBokConcept([]);
  }

  async onDownload() {
    // check if file is available; if available, download, otherwise, set error message telling no file available to downlaod!
    if (this.pdfDoc) {
      // function returns the configured string in RDF format
      const relationsMetadata = this.configureMetaData(this.bokRelations);
      this.pdfDoc?.setTitle(this.fileName + '_annotated');

      // stores the RDF format string holding BoK keys and relations
      this.pdfDoc?.setSubject(relationsMetadata);
      const pdfBytes = await this.pdfDoc.save();

      // set title and download pdf
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.style.display = 'none';
      link.download = this.fileName + '_annotated.pdf';
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  }

  onSave() {
    if (this.pdfDoc && this.formContent) {
      const relationsMetadata = this.configureMetaData(this.bokRelations);
      this.pdfDoc?.setTitle(this.fileName + '_annotated');
      this.pdfDoc?.setSubject(relationsMetadata);
      let isSuccess = true;
      this.databaseService.saveDocument(this.pdfDoc, this.formContent, this.bokRelations).pipe(
        catchError((error) => {
          isSuccess = false;
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.message ?? 'Something went wrong. Try again later or contact the administrator.', 
            life: 3000, 
            closable: true 
          });
          return of(null);
        }),
        finalize(() => {
          if (isSuccess) {
            this.messageService.add({ 
              severity: 'info', 
              summary: 'Info', 
              detail: `Document saved without problems.`,
              life: 3000, 
              closable: true 
            }); 
          }
        })
      ).subscribe();
    }
  }

  updateFormContent(data: DocumentForm | null) {
    this.formContent = data;
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

  navigateToMyDocs() {
    this.router.navigate(['list'], { replaceUrl: true })
  }
}
