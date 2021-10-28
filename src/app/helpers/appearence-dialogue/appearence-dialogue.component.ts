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
  description:string;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<AppearenceDialogueComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.description = data.title;
    this.form = this.fb.group({
      description: [this.description, []]
    });
  }


  ngOnInit(): void { }

  save(): void {
    this.dialogRef.close(this.form.value)
    // TODO implement! @Annika :)
  }

  close(): void {
    this.dialogRef.close();
    // TODO implement! @Annika :)
  }
}
