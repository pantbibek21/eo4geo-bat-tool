import { Component, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputIconModule } from "primeng/inputicon";
import { IconFieldModule } from "primeng/iconfield";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { TextareaModule } from 'primeng/textarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { BehaviorSubject, Subscription, take } from 'rxjs';
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

  @Input() isPdfAvailable: boolean = false;
  @Input() logged: boolean = false;
  @Input() formData: DocumentForm = new DocumentForm();
  @Output() formDataChange = new BehaviorSubject<DocumentForm>(this.formData);
  
  stateOptions: any[] = [{ label: 'Public', value: true },{ label: 'Private', value: false }];

  organizations: {_id: string, name: string}[] = [];
  selectedOrganization: {_id: string, name: string} | null = null;

  organizationDivisions: Map<string, string[]> = new Map();
  selectedDivision: string | null = null;

  private organizationsSubscription!: Subscription;

  constructor(private databaseService: DatabaseService) {}

  ngOnInit() {
    this.selectedOrganization = (this.formData?.organization._id == '' && this.formData?.organization.name == '') ? null : this.formData?.organization!;
    this.selectedDivision = this.formData?.division ?? null;

    this.organizationsSubscription = this.databaseService.getUserOrganizationList().subscribe(orgs => {
      this.organizations = orgs;
      this.organizationDivisions = new Map();
      this.organizations.forEach( org => {
        this.databaseService.getOrganizationDivisions(org._id).pipe(take(1)).subscribe(divisions => {
          this.organizationDivisions.set(org._id, divisions);
        })
      })
    })
  }

  ngOnDestroy(): void {
    this.organizationsSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData']) {
      this.selectedOrganization = (this.formData?.organization._id == '' && this.formData?.organization.name == '') ? null : this.formData?.organization;
      this.selectedDivision = this.formData?.division ?? null;
    }
  }

  updateDocumentForm() {
    if (this.selectedOrganization == null || this.selectedDivision == null || this.formData.name.trim() == '') {
      return;
    }
    this.formData.organization = this.selectedOrganization ?? {_id: '', name: ''};
    this.formData.division = this.selectedDivision ?? '';
    this.formDataChange.next(this.formData);
  }
}
