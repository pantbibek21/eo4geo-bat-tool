import { Component, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputIconModule } from "primeng/inputicon";
import { IconFieldModule } from "primeng/iconfield";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { TextareaModule } from 'primeng/textarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { FileService } from '../../services/file.service';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { DatabaseService } from '../../services/database.service';
import { DocumentForm } from '../../model/documentForm';

@Component({
  standalone: true,
  selector: 'app-document-information',
  imports: [CommonModule, FormsModule, InputIconModule, IconFieldModule, InputTextModule, FloatLabelModule, TextareaModule, SelectButtonModule, SelectModule],
  templateUrl: './document-information.component.html',
  styleUrl: './document-information.component.css',
})
export class DocumentInformationComponent {

  @Output() formContent = new BehaviorSubject<DocumentForm | null>(null)
  
  fileName: string = '';
  description: string = '';
  isPdfAvailable: boolean = false;
  logged: boolean = false;

  stateOptions: any[] = [{ label: 'Public', value: true },{ label: 'Private', value: false }];
  publicFile: boolean = false;

  organizations: {_id: string, name: string}[] = [];
  selectedOrganization: {_id: string, name: string} | null = null;

  organizationDivisions: Map<string, string[]> = new Map();
  selectedDivision: string | null = null;

  private isPdfAvailableSuscription!: Subscription; 
  private formDataSubscription!: Subscription;
  private loggedSubscription!: Subscription;
  private organizationsSubscription!: Subscription;

  constructor(private fileService: FileService, private sessionService: SessionService, private databaseService: DatabaseService) {}

  ngOnInit() {
    this.isPdfAvailableSuscription = this.fileService.pdfFile$.subscribe(file => this.isPdfAvailable = file != null);

    this.formDataSubscription = this.fileService.formData$.subscribe( formData => {
      this.fileName = formData?.name ?? '';
      this.description = formData?.description ?? '';
      this.publicFile = formData?.publicFile ?? false;
      this.selectedOrganization = (formData?.organization._id == '' && formData?.organization.name == '') ? null : formData?.organization!;
      this.selectedDivision = formData?.division ?? null;
    });

    this.loggedSubscription = this.sessionService.logged$.subscribe(newValue => this.logged = newValue);

    this.organizationsSubscription = this.databaseService.getUserOrganizations().subscribe(orgs => {
      this.organizations = orgs;
      this.organizationDivisions = new Map();
      this.organizations.forEach( (org, index) => {
        this.databaseService.getOrganizationDivisions(org._id).pipe(take(1)).subscribe(divisions => {
          this.organizationDivisions.set(org._id, divisions);
        })
      })
    })
  }

  ngOnDestroy(): void {
    this.isPdfAvailableSuscription.unsubscribe();
    this.formDataSubscription.unsubscribe();
    this.loggedSubscription.unsubscribe();
    this.organizationsSubscription.unsubscribe();
  }

  updateDocumentForm() {
    if (this.selectedOrganization == null || this.selectedDivision == null || this.fileName.trim() == '') {
      this.formContent.next(null);
      return;
    }
    const newFormInfo: DocumentForm = {
      name: this.fileName,
      description: this.description,
      publicFile: this.publicFile,
      organization: this.selectedOrganization,
      division: this.selectedDivision
    };
    this.formContent.next(newFormInfo);
  }
}
