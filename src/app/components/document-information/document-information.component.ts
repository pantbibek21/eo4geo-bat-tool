import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputIconModule } from "primeng/inputicon";
import { IconFieldModule } from "primeng/iconfield";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { TextareaModule } from 'primeng/textarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FileService } from '../../services/file.service';
import { Subscription } from 'rxjs';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-document-information',
  imports: [CommonModule, FormsModule, InputIconModule, IconFieldModule, InputTextModule, FloatLabelModule, TextareaModule, SelectButtonModule],
  templateUrl: './document-information.component.html',
  styleUrl: './document-information.component.css',
})
export class DocumentInformationComponent {
  
  fileName: string = '';
  description: string = '';
  isPdfAvailable: boolean = false;
  logged: boolean = false;

  stateOptions: any[] = [{ label: 'Public', value: true },{ label: 'Private', value: false }];
  publicFile: boolean = false;

  private isPdfAvailableSuscription!: Subscription; 
  private fileNameSubscription!: Subscription;
  private loggedSubscription!: Subscription;

  constructor(private fileService: FileService, private sessionService: SessionService) {}

  ngOnInit() {
    this.isPdfAvailableSuscription = this.fileService.pdfFile$.subscribe(file => {
      this.isPdfAvailable = file != null;
    });

    this.fileNameSubscription = this.fileService.fileName$.subscribe( newName => this.fileName = newName);

    this.loggedSubscription = this.sessionService.logged$.subscribe(newValue => {
      this.logged = newValue;
    })
  }

  ngOnDestroy(): void {
    this.isPdfAvailableSuscription.unsubscribe();
    this.fileNameSubscription.unsubscribe();
    this.loggedSubscription.unsubscribe();
  }
}
