import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-appearence-dialogue',
  templateUrl: './appearence-dialogue.component.html',
  styleUrls: ['./appearence-dialogue.component.css']
})
export class AppearenceDialogueComponent implements OnInit {

  form: FormGroup;
  test: boolean[];

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<AppearenceDialogueComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.test = [];
    for (let i = 0; i < data.test.length; i++) {
      this.test[i] = data.test[i];
    }

    this.form = this.fb.group({
      checkbox0: this.test[0],
      checkbox1: this.test[1]
      //#checkboxNumber
    });
  }


  ngOnInit(): void { }

  save(): void {
    this.dialogRef.close(this.form.value)
  }

  close(): void {
    this.dialogRef.close();
  }
}
