import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

import { FileService } from '../../services/file.service';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { SharedService } from '../../services/shared.service';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PdfExtractService } from '../../services/pdf-extract.service';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-ai-modal',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    CommonModule,
    ChipModule,
    TooltipModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    RadioButtonModule,
  ],
  templateUrl: './ai-modal.component.html',
  styleUrl: './ai-modal.component.css',
})
export class AiModalComponent implements OnInit, OnDestroy {
  @Input() concept: string = 'GIST';
  annotationNumber: number = 5;
  annotationDepth: string = '';
  isLoading: boolean = false;
  gptReponse: Array<string> = [];
  bokConcepts: Array<string> = [];
  aiBokConcepts: string[] = [];
  selectedAiConcepts: string[] = [];
  errorMessage: string = '';
  extractedContent: string = '';

  private bokConceptsSubscription!: Subscription;

  constructor(
    private fileService: FileService,
    private sharedService: SharedService,
    private pdfExtractService: PdfExtractService,
    private aiService: AiService
  ) {}

  ngOnInit() {
    this.bokConceptsSubscription = this.fileService.bokConcept$.subscribe(
      (concepts) => {
        this.bokConcepts = concepts;
      }
    );
  }

  ngOnDestroy(): void {
    this.bokConceptsSubscription.unsubscribe();
  }

  async getExtractedContent() {
    this.extractedContent = await this.pdfExtractService.extractText();
  }

  generateAnnotations() {
    this.aiService.generateAnnotation();
  }

  generateRelation() {
    this.isLoading = true;

    setTimeout(() => {
      // render the relations in below container
      // invoke the gpt and gpt provides following
      this.gptReponse = [
        'SA3-2-1-1-6',
        'SA3-2-1-1-7',
        'SA3-2-1-1-8',
        'SA3-2-1-1-9',
        'SA3-2-1-1-10',
        'SA3-2-1-1-5',
        'SA3-2-1-1-5',
        'SA3-2-1-1-1',
        'SA3-2-1-1-2',
        'SA3-2-1-1-3',
        'SA3-2-1-1-4',
      ];

      // check if generated relation is already in our BoK concepts; otherwise keep
      this.gptReponse.forEach((item) => {
        if (!this.bokConcepts.includes(item)) {
          this.aiBokConcepts.push(item);
        }
      });

      this.isLoading = false;
    }, 1000);
  }

  // toggle the AI generated relations
  toggleConceptSelection(concept: string) {
    const index = this.selectedAiConcepts.indexOf(concept);
    if (index === -1) {
      this.selectedAiConcepts.push(concept);
    } else {
      this.selectedAiConcepts.splice(index, 1);
    }
  }

  // add the user selected BoK relations
  addBokSelection() {
    const selected = this.selectedAiConcepts;

    const newConcepts = selected.filter(
      (concept) => !this.bokConcepts.includes(concept)
    );

    if (newConcepts.length === 0) {
      this.showError('No concept selected!');
      return;
    }

    this.fileService.setBokConcept([...this.bokConcepts, ...newConcepts]);

    // Clear selections
    this.selectedAiConcepts = [];
    this.bokConcepts = [];

    this.closeModal();
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = ''), 3000);
  }

  closeModal() {
    this.fileService.setIsModalVisible(false);
  }

  getBackgroundColor(concept: string) {
    return this.sharedService.getBackgroundColor(concept);
  }

  // fetches the BoK keyword title
  getConceptName(concept: string) {
    return this.sharedService.getConceptName(concept);
  }
}
