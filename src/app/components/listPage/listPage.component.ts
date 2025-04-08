import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from "primeng/button";
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from "primeng/api";
import { DatabaseService } from '../../services/database.service';
import { AnnotatedDocument } from '../../model/annotatedDocument';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { DocumentModalComponent } from "../document-modal/document-modal.component";

@Component({
  standalone: true,
  selector: 'list-page',
  templateUrl: './listPage.component.html',
  styleUrls: ['./listPage.component.css'],
  imports: [CommonModule, ToastModule, ButtonModule, CardModule, ConfirmDialogModule, FloatLabelModule, InputTextModule, FormsModule,
    IconFieldModule, InputIconModule, DocumentModalComponent],
  providers: [MessageService, ConfirmationService]
})
export class ListPageComponent implements OnInit, OnDestroy {
  documents: AnnotatedDocument[] = [];
  searchValue: string = '';

  filteredDocuments: AnnotatedDocument[] = [];

  viewModal: boolean = false;
  modalName: string = '';
  modalConcepts: string[] = []

  private documentsSubscription!: Subscription;

  constructor(private databaseService: DatabaseService, private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.documentsSubscription = this.databaseService.getAnnotatedDocuments().subscribe(newDocuments => {
      this.documents = newDocuments;
      this.filteredDocuments = this.documents;
    });
  }

  ngOnDestroy() {
    this.documentsSubscription.unsubscribe();
  }

  filterList() {
    this.filteredDocuments = this.documents.filter(doc => doc.name.toLowerCase().includes(this.searchValue.toLowerCase()))
  }

  deleteModal(event: Event, document: AnnotatedDocument) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Do you want to delete this document?',
        header: 'Delete Document',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
            label: 'Cancel',
            severity: 'secondary',
        },
        acceptButtonProps: {
            label: 'Delete',
            severity: 'primary',
        },

        accept: () => {
          this.deleteDocument(document);
        },
        reject: () => {
        },
    });
  }

  deleteDocument(document: AnnotatedDocument) {
    const docPath = `other/custom-${document.name}-${document.userId}`;
    const deleteFromStorage = this.documents.filter(doc => `other/custom-${doc.name}-${doc.userId}` == docPath).length == 1;
    let isSuccess = true;
    this.databaseService.deleteDocument(document, deleteFromStorage).pipe(
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
            detail: `You deleted the document without problems.`,
            life: 3000, 
            closable: true 
          }); 
        }
      })
    ).subscribe();
  }

  showModal(name: string, concepts: string[]) {
    this.modalConcepts = concepts;
    this.modalName = name;
    this.viewModal = true;
  }
}
