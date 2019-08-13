import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ɵConsole
} from "@angular/core";
import { Plugins, CameraResultType, CameraSource } from "@capacitor/core";
import { DomSanitizer } from "@angular/platform-browser";
import { File } from "@ionic-native/file/ngx";
import { Capacitor } from '@capacitor/core';

import {
  MediaCapture,
  MediaFile,
  CaptureError
} from "@ionic-native/media-capture/ngx";
import { Media } from "@ionic-native/media/ngx";

@Component({
  selector: "app-recipes",
  templateUrl: "./recipes.page.html",
  styleUrls: ["./recipes.page.scss"]
})
export class RecipesPage implements OnInit {
  photo;
  showVideo;
  showAudio;

  files: any[];

  filePath;

  @ViewChild("audio", { static: true })
  audio: ElementRef<HTMLAudioElement>;

  @ViewChild("video", { static: true })
  video: ElementRef<HTMLVideoElement>;

  constructor(
    private sanitizer: DomSanitizer,
    private mediaCapture: MediaCapture,
    private media: Media,
    private file: File
  ) {}

  ngOnInit() {}

  accessCamera() {
    Plugins.Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    }).then(image => {
      this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(
        "data:image/jpeg;base64," + image.base64String
      );
    });
    // Plugins.Camera.getPhoto({
    //   quality: 100,
    //   resultType: CameraResultType.DataUrl,
    //   source: CameraSource.Prompt
    // }).then(image => {
    //   this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && image.dataUrl);
    // });
  }

  recordAudio() {
    this.mediaCapture
      .captureAudio({
        limit: 1
      })
      .then(
        (data: MediaFile[]) => {
          console.log(data);
          // this.playAudio(data[0]);
          const audio: HTMLAudioElement = this.audio.nativeElement;
          audio.src = data[0].fullPath.replace(/file:\/\//g, "");
          audio.play();
        },
        (err: CaptureError) => console.error(err)
      );
  }

  playAudio(file: MediaFile) {
    const audioFile = this.media.create(file["localURL"]);
    audioFile.play();
  }

  // Work
  captureVIdeo() {
    this.mediaCapture
      .captureVideo({
        quality: 50,
        limit: 1
      })
      .then(
        (data: MediaFile[]) => {
          const convertSrcFile = Capacitor.convertFileSrc(data[0].fullPath);
          const video: HTMLVideoElement = this.video.nativeElement;
          video.src = convertSrcFile;
          video.play();
        },
        (err: CaptureError) => console.error(err)
      );
  }
}
