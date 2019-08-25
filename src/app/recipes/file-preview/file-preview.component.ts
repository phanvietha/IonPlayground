import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { AttachFile } from "../attach-file.model";

enum FileType {
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  IMAGE = "IMAGE"
}

@Component({
  templateUrl: "./file-preview.component.html",
  styleUrls: ["./file-preview.component.scss"]
})
export class FilePreviewComponent implements OnInit {
  @Input() file: AttachFile;
  fileType: FileType;
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.fileTypeContain("video")) {
      this.fileType = FileType.VIDEO;
    } else if (this.fileTypeContain("audio")) {
      this.fileType = FileType.AUDIO;
    } else if (this.fileTypeContain("image")) {
      this.fileType = FileType.IMAGE;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }

  fileTypeContain(text: string) {
    return this.file.type.indexOf(text) !== -1;
  }
}
