import { Component, OnDestroy, OnInit } from '@angular/core';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { BokComponent } from '@eo4geo/ngx-bok-visualization';
import { AnnotateDocumentComponent } from '../annotate-document/annotate-document.component';
import { PDFDocument } from 'pdf-lib';
import { CommonModule } from '@angular/common';
import { catchError, finalize, of, Subscription, switchMap, take, tap } from 'rxjs';
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
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'edit-page',
  templateUrl: './editPage.component.html',
  styleUrls: ['./editPage.component.css'],
  imports: [
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
export class EditPageComponent implements OnInit, OnDestroy {
  concept: string = 'GIST'
  logged: boolean = false;
  pdfDoc: PDFDocument | null = null;

  formContent: DocumentForm | null = null;

  private bokRelations: string[] = [];

  private bokRelationsSubscription!: Subscription;
  private loggedSubscription!: Subscription;

  constructor(private fileService: FileService, private sessionService: SessionService, private databaseService: DatabaseService, 
              private messageService: MessageService, private router: Router, private route: ActivatedRoute,private http: HttpClient) {}

  ngOnInit(): void {
    const documentId = this.route.snapshot.paramMap.get('id') as string;
    this.databaseService.getDocument(documentId).pipe(
      take(1),
      switchMap(document => {
        const newConcepts = this.formatFirestoreConcepts(document.concepts);
        const newDocForm = {
          name: document.name,
          description: document.description,
          publicFile: document.isPublic,
          organization: {_id: document.orgId, name: document.orgName},
          division: document.division
        };
        this.fileService.setDocumentForm(newDocForm);
        this.fileService.setBokConcept(newConcepts);
        return this.http.get(document.url, { responseType: 'blob' })
      }),
      switchMap( blob => blob.arrayBuffer()),
      switchMap( file => PDFDocument.load(file)),
      tap( file => {
        this.fileService.setPdfFile(file)
        this.pdfDoc = file;
      })
    ).subscribe();

    this.bokRelationsSubscription = this.fileService.bokConcept$.subscribe(concepts => {
      this.bokRelations = concepts;
    });
    this.loggedSubscription = this.sessionService.logged$.subscribe(newValue => {
      this.logged = newValue;
    })
  }

  ngOnDestroy() {
    this.bokRelationsSubscription.unsubscribe();
    this.loggedSubscription.unsubscribe();
    this.fileService.resetValues();
  }

  private formatFirestoreConcepts(concepts: string[]){
    const regex = /\[(.*?)\]/;
    return concepts.map(concept => concept.match(regex)?.[1])
    .filter(Boolean) as string[];
  }

  async onDownload() {
    // check if file is available; if available, download, otherwise, set error message telling no file available to downlaod!
    if (this.pdfDoc) {
      // function returns the configured string in RDF format
      const relationsMetadata = this.configureMetaData(this.bokRelations);
      this.pdfDoc?.setTitle(this.formContent?.name + '_annotated');

      // stores the RDF format string holding BoK keys and relations
      this.pdfDoc?.setSubject(relationsMetadata);
      const pdfBytes = await this.pdfDoc.save();

      // set title and download pdf
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.style.display = 'none';
      link.download = this.formContent?.name + '_annotated.pdf';
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  }

  onSave() {
    if (this.pdfDoc && this.formContent) {
      const relationsMetadata = this.configureMetaData(this.bokRelations);
      this.pdfDoc?.setTitle(this.formContent?.name + '_annotated');
      this.pdfDoc?.setSubject(relationsMetadata);
      let isSuccess = true;
      this.databaseService.updateDocument(this.pdfDoc, this.formContent, this.bokRelations).pipe(
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
            this.navigateToMyDocs()
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
