import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputIconModule } from "primeng/inputicon";
import { IconFieldModule } from "primeng/iconfield";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { TextareaModule } from 'primeng/textarea';
import { FileService } from '../../services/file.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document-information',
  imports: [CommonModule, FormsModule, InputIconModule, IconFieldModule, InputTextModule, FloatLabelModule, TextareaModule],
  templateUrl: './document-information.component.html',
  styleUrl: './document-information.component.css',
})
export class DocumentInformationComponent {
  
  fileName: string = '';
  description: string = '';
  isPdfAvailable: boolean = false;

  @Output() fileNameChange: EventEmitter<string> = new EventEmitter();
  @Output() descriptionChange: EventEmitter<string> = new EventEmitter();

  private isPdfAvailableSuscription!: Subscription; 
  private fileNameSubscription!: Subscription;

  constructor(private fileService: FileService) {}

  ngOnInit() {
    this.isPdfAvailableSuscription = this.fileService.pdfFile$.subscribe(file => {
      this.isPdfAvailable = file != null;
    });

    this.fileNameSubscription = this.fileService.fileName$.subscribe( newName => this.fileName = newName);
  }

  ngOnDestroy(): void {
    this.isPdfAvailableSuscription.unsubscribe();
    this.fileNameSubscription.unsubscribe();
  }
}
