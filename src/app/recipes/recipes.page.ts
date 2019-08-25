import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ɵConsole,
  AfterViewInit
} from "@angular/core";
import { Plugins, CameraResultType, CameraSource, Capacitor } from "@capacitor/core";
import { DomSanitizer } from "@angular/platform-browser";
import { File } from "@ionic-native/file/ngx";

import {
  MediaCapture,
  MediaFile,
  CaptureError
} from "@ionic-native/media-capture/ngx";
import { Media, MediaObject } from "@ionic-native/media/ngx";

import { AttachFile } from "./attach-file.model";
import { fromEvent, interval, from } from "rxjs";
import {
  takeUntil,
  tap,
  pluck,
  map,
  finalize,
  switchMap
} from "rxjs/operators";

@Component({
  selector: "app-recipes",
  templateUrl: "./recipes.page.html",
  styleUrls: ["./recipes.page.scss"]
})
export class RecipesPage implements OnInit, AfterViewInit {
  attachedFiles: AttachFile[];

  onMouseDown$;
  onMouseMove$;
  onMouseUp$;
  isRecording: boolean;
  audioFile: MediaObject;
  amplitude$;

  constructor(
    private sanitizer: DomSanitizer,
    private mediaCapture: MediaCapture,
    private media: Media,
    private file: File
  ) {}

  ngOnInit() {
    this.attachedFiles = [];
  }

  ngAfterViewInit() {
    this.onMouseMove$ = fromEvent<TouchEvent>(document, "touchmove");
    this.onMouseUp$ = fromEvent<TouchEvent>(document, "touchend");
    this.onMouseDown$ = fromEvent<TouchEvent>(
      document.querySelector("#recordBtn"),
      "touchstart"
    );

    this.onMouseDown$.subscribe(event => {
      const recordProgress = document.querySelector(
        "#recordSymbol"
      ) as HTMLDivElement;
      const stopRecord = document.querySelector(
        "#stopRecordSymbol"
      ) as HTMLDivElement;

      this.handleMouseDown(event, recordProgress, stopRecord);

      this.onMouseMove$
        .pipe(
          // Get touch event of first finger touch
          pluck("touches", "0"),
          // Get touch x, y
          map(this.getTouchCoordinate),
          // Unsubscribe when release mouse
          takeUntil(this.onMouseUp$),
          // Hide record progress
          finalize(() => this.handleMouseUp(recordProgress, stopRecord))
        )
        .subscribe(coord => {
          recordProgress.style.webkitTransform = `translate(${
            coord.x
          }px, ${coord.y - 150}px)`;
        });
    });
  }

  handleMouseDown(
    event: TouchEvent,
    recordProgess: HTMLDivElement,
    stopRecord: HTMLDivElement
  ) {
    const coord = this.getTouchCoordinate(event.touches[0]);
    recordProgess.style.webkitTransform = `translate(${coord.x}px, ${coord.y -
      150}px)`;
    recordProgess.style.opacity = "100";

    // Stop record
    const middleScreenX = innerWidth / 2 - 20;
    const middleScreenY = innerHeight / 2 - 20;
    // Translate to middle screen
    stopRecord.style.webkitTransform = `translate(${middleScreenX}px, ${middleScreenY}px)`;

    // Override css variable before start animation
    stopRecord.style.setProperty("--middle-screenX", `${middleScreenX}px`);
    stopRecord.style.setProperty("--middle-screenY", `${middleScreenY}px`);
    // Kick animation in
    stopRecord.style.animationName = "slideIn";
    // Start recording
    this.recordAudio();
  }

  handleMouseUp(recordProgress: HTMLDivElement, stopRecord: HTMLDivElement) {
    recordProgress.style.opacity = "0";
    recordProgress.style.webkitTransform = `translate(-100px, -100px)`;

    stopRecord.style.animation = "";
    stopRecord.style.webkitTransform = `translate(-100px, -100px)`;
    this.removeAmplitudeListen();
  }

  private getTouchCoordinate = (touch: Touch) => ({
    x: touch.pageX,
    y: touch.pageY
  });

  captureVideo() {
    this.mediaCapture
      .captureVideo({
        quality: 50,
        limit: 1
      })
      .then(videos => {
        console.log(videos[0]);
        const file = new AttachFile(videos[0]);
        this.attachedFiles = [...this.attachedFiles, file];
      });
  }

  recordAudio() {
    const fileName = `${new Date().getTime()}.wav`;
    const audioSrc = this.file
      .createFile(this.file.dataDirectory, fileName, true)
      .then(() => {
        this.audioFile = this.media.create(Capacitor.convertFileSrc(this.file.dataDirectory.replace(/^file:\/\//, '') + fileName));
        this.audioFile.onSuccess.subscribe(() => console.log("yay"));
        this.audioFile.startRecord();
        this.amplitude$ = interval(1000)
          .pipe(
            takeUntil(this.onMouseUp$),
            switchMap(_ => from(this.audioFile.getCurrentAmplitude())),
            tap(console.log)
          )
          .subscribe(console.log);
      });
  }

  removeAmplitudeListen() {
    this.audioFile.stopRecord();
    console.log(this.audioFile);
    this.audioFile.play();
    this.amplitude$ = null;
  }

  takePicture() {
    this.mediaCapture
      .captureImage({
        limit: 1
      })
      .then(pictures => {
        console.log(pictures[0]);
        const file = new AttachFile(pictures[0]);
        this.attachedFiles = [...this.attachedFiles, file];
      });
  }

  attachFile() {}
}
