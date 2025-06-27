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
  private errorMessageSubscription!: Subscription;

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
    this.errorMessageSubscription = this.aiService.errorMessage$.subscribe(
      (msg) => {
        this.errorMessage = msg;
      }
    );
  }

  ngOnDestroy(): void {
    this.bokConceptsSubscription.unsubscribe();
    this.errorMessageSubscription.unsubscribe();
  }

  async generateAnnotations() {
    this.isLoading = true;
    this.errorMessage = '';

    this.extractedContent = await this.pdfExtractService.extractText();
    console.log(this.extractedContent);

    const rawOutput = await this.aiService.generateAnnotation(
      this.extractedContent,
      this.annotationDepth,
      this.annotationNumber
    );

    if (!rawOutput) {
      this.errorMessage = 'Failed to generate annotation.';
      this.isLoading = false;
      return;
    }

    let response;

    try {
      response = JSON.parse(rawOutput);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      this.errorMessage = 'Invalid response format from AI service.';
      this.isLoading = false;
      return;
    }

    console.log(response);

    response.forEach((item: string) => {
      if (!this.bokConcepts.includes(item)) {
        this.aiBokConcepts.push(item);
      }
    });

    console.log(response);
    this.isLoading = false;
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
    if (concept == undefined) {
      return;
    }

    return this.sharedService.getBackgroundColor(concept);
  }

  // fetches the BoK keyword title
  getConceptName(concept: string) {
    return this.sharedService.getConceptName(concept);
  }
}
