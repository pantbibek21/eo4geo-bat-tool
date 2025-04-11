import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable, Subscription, take } from 'rxjs';
import { FileService } from '../../services/file.service';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeUtils } from '@primeng/themes';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-annotate-document',
  imports: [CommonModule, ButtonModule, ChipModule, TooltipModule],
  templateUrl: './annotate-document.component.html',
  styleUrl: './annotate-document.component.css',
})
export class AnnotateDocumentComponent implements OnInit, OnDestroy {
  @Input() concept: string = 'GIST';
  bokConcepts: string[] = [];
  message: string = '';
  isPdfAvailable: boolean = false;
  isModalVisible: boolean = false;

  private bokConceptsSubscription!: Subscription;
  private isPdfAvailableSuscription!: Subscription;
  private isModalVisibleSubscription!: Subscription;

  constructor(
    private fileService: FileService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.bokConceptsSubscription = this.fileService.bokConcept$.subscribe(
      (concepts) => {
        this.bokConcepts = concepts;
      }
    );

    this.isPdfAvailableSuscription = this.fileService.pdfFile$.subscribe(
      (file) => {
        this.isPdfAvailable = file != null;
      }
    );

    this.isModalVisibleSubscription =
      this.fileService.isModalVisible$.subscribe((value) => {
        this.isModalVisible = value;
      });
  }

  ngOnDestroy(): void {
    this.bokConceptsSubscription.unsubscribe();
    this.isPdfAvailableSuscription.unsubscribe();
    this.isModalVisibleSubscription.unsubscribe();
  }

  onClear() {
    this.fileService.setBokConcept([]);
  }

  deleteBokConcept(concept: string) {
    this.fileService.setBokConcept(
      this.bokConcepts.filter((item) => item !== concept)
    );
  }

  addAnnotation() {
    if (this.bokConcepts.includes(this.concept)) {
      this.message = 'Concept already included!';

      setTimeout(() => (this.message = ''), 3000);
    } else {
      this.fileService.setBokConcept([...this.bokConcepts, this.concept]);
    }
  }

  getBackgroundColor(concept: string): Observable<string> {
    return this.sharedService.getBackgroundColor(concept);
  }

  // fetches the BoK keyword title
  getConceptName(concept: string) {
    return this.sharedService.getConceptName(concept);
  }

  renderModal() {
    // set the flag to true that shows the modal with form
    this.fileService.setIsModalVisible(true);
  }
}
