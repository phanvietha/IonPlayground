import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Plugins, Capacitor } from "@capacitor/core";
import { DomSanitizer } from "@angular/platform-browser";
import { File } from "@ionic-native/file/ngx";

import { MediaCapture } from "@ionic-native/media-capture/ngx";
import { Media, MediaObject } from "@ionic-native/media/ngx";
const { LocalNotifications } = Plugins;

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
import { ModalController } from "@ionic/angular";
import { FilePreviewComponent } from "./file-preview/file-preview.component";

interface Coordinate {
  x: number;
  y: number;
}

const elementWidth = 20;
const offsetY = 50;
const slideDistance = 50;
@Component({
  selector: "app-recipes",
  templateUrl: "./recipes.page.html",
  styleUrls: ["./recipes.page.scss"]
})
export class RecipesPage implements OnInit, AfterViewInit {
  attachedFiles: AttachFile[];
  flag: boolean;

  onMouseDown$;
  onMouseMove$;
  onMouseUp$;
  isRecording: boolean;
  audioFile: MediaObject;
  amplitude$;

  animationId;

  middleScreenY: number;

  _recordProressPos: Coordinate;
  _stopRecordPos: Coordinate;

  recordProgress: HTMLDivElement;
  stopRecord: HTMLDivElement;

  constructor(
    private sanitizer: DomSanitizer,
    private mediaCapture: MediaCapture,
    private media: Media,
    private file: File,
    private modalController: ModalController
  ) {
    this.middleScreenY = innerHeight / 2;
  }

  ngOnInit() {
    this.attachedFiles = [];
  }

  ngAfterViewInit() {
    this.createStreamEvent();

    this.onMouseDown$.subscribe(event => {
      this.recordProgress = document.querySelector(
        "#recordSymbol"
      ) as HTMLDivElement;
      this.stopRecord = document.querySelector(
        "#stopRecordSymbol"
      ) as HTMLDivElement;

      this.handleMouseDown(event, this.recordProgress, this.stopRecord);

      this.onMouseMove$
        .pipe(
          // Get touch event of first finger touch
          pluck("touches", "0"),
          // Get touch x, y
          map(this.getTouchCoordinate),
          // Unsubscribe when release mouse
          takeUntil(this.onMouseUp$),
          // Hide record progress
          finalize(() => this.handleMouseUp(this.recordProgress, this.stopRecord))
        )
        .subscribe(coord => {
          // store record position
          this._recordProressPos = { x: coord.x, y: coord.y - 150 };
          this.recordProgress.style.webkitTransform = `translate(${
            coord.x
          }px, ${coord.y - 150}px)`;

          if (coord.y <= this.middleScreenY + offsetY + 150 && !this.flag) {
            this.firstAnimation();
          }
        });
    });
  }

  updateStopPos(timestamp) {
    if (
      this._recordProressPos.x !== this._stopRecordPos.x ||
      this._recordProressPos.y !== this._stopRecordPos.y
    ) {
      this.getUpdatePosition();
      requestAnimationFrame(this.updateStopPos.bind(this));
    } else if (
      this._recordProressPos.x === this._stopRecordPos.x &&
      this._recordProressPos.y === this._stopRecordPos.y
    ) {
      cancelAnimationFrame(this.animationId);
    }
  }

  firstAnimation() {
    this.stopRecord.style.animation = '';
    this.stopRecord.style.opacity = '1';

    requestAnimationFrame(this.updateStopPos.bind(this));
  }

  getUpdatePosition() {
    const operatorX = this._stopRecordPos.x < this._recordProressPos.x ? 1 : -1;
    const operatorY = this._stopRecordPos.y < this._recordProressPos.y ? 1 : -1;
    const x = Math.abs(this._stopRecordPos.x - this._recordProressPos.x);
    const y = Math.abs(this._stopRecordPos.y - this._recordProressPos.y);

    const xOffset = x > 0.5 ? 0.5 : x;
    const yOffset = y > 0.5 ? 0.5 : y;
   
    this._stopRecordPos = {
      x: this._stopRecordPos.x + (operatorX * xOffset),
      y: this._stopRecordPos.y + (operatorY * yOffset)
    };
    this.stopRecord.style.transform = `translate(${this._stopRecordPos.x}px,
       ${this._stopRecordPos.y}px)`
  }

  handleMouseDown(
    event: TouchEvent,
    recordProgess: HTMLDivElement,
    stopRecord: HTMLDivElement
  ) {
    this.showRecordProgess(recordProgess, event);
    this.showTopRecording(stopRecord);
    // Start recording
    this.recordAudio();
  }

  createStreamEvent() {
    this.onMouseMove$ = fromEvent<TouchEvent>(document, "touchmove");
    this.onMouseUp$ = fromEvent<TouchEvent>(document, "touchend");
    this.onMouseDown$ = fromEvent<TouchEvent>(
      document.querySelector("#recordBtn"),
      "touchstart"
    );
  }

  showRecordProgess(recordProgess, event) {
    const coord = this.getTouchCoordinate(event.touches[0]);
    this._recordProressPos = coord;
    recordProgess.style.webkitTransform = `translate(${coord.x}px, ${coord.y -
      150}px)`;
    recordProgess.style.opacity = "100";
  }

  showTopRecording(stopRecord) {
    // Stop record
    const middleScreenX = innerWidth / 2 - elementWidth;
    const middleScreenY = innerHeight / 2 - offsetY;
    // Store position
    this._stopRecordPos = { x: middleScreenX, y: middleScreenY };

    // Translate to middle screen
    stopRecord.style.webkitTransform = `translate(${middleScreenX}px, ${middleScreenY}px)`;

    // Override css variable before start animation
    stopRecord.style.setProperty("--middle-screenX", `${middleScreenX}px`);
    stopRecord.style.setProperty("--middle-screenY", `${middleScreenY}px`);
    // Kick animation in
    stopRecord.style.animationName = "slideIn";
  }

  /**
   * Hide recordProgress, stopRecord
   * Stop audio recording
   */
  handleMouseUp(recordProgress: HTMLDivElement, stopRecord: HTMLDivElement) {
    recordProgress.style.opacity = "0";
    recordProgress.style.webkitTransform = `translate(-100px, -100px)`;

    stopRecord.style.animation = "";
    stopRecord.style.webkitTransform = `translate(-100px, -100px)`;
    // this.removeAmplitudeListen(); // HA temp remove
  }

  private getTouchCoordinate = (touch: Touch) => ({
    x: touch.pageX,
    y: touch.pageY
  });

  recordAudio() {
    // const fileName = `${new Date().getTime()}.m4a`;
    // const audioSrc = this.file
    //   .createFile(this.file.dataDirectory, fileName, true)
    //   .then((file) => {
    //     this.audioFile = this.media.create(file.nativeURL);
    //     this.audioFile.startRecord();
    //     this.amplitude$ = interval(100)
    //       .pipe(
    //         takeUntil(this.onMouseUp$),
    //         switchMap(_ => from(this.audioFile.getCurrentAmplitude())),
    //       )
    //       .subscribe(console.log);
    //   });
  }

  removeAmplitudeListen() {
    this.audioFile.stopRecord();
    this.audioFile.play();
    this.amplitude$ = null;
  }

  captureVideo() {
    this.mediaCapture
      .captureVideo({
        quality: 50,
        limit: 1
      })
      .then(videos => {
        const file = new AttachFile(videos[0]);
        this.attachedFiles = [...this.attachedFiles, file];
      });
  }

  takePicture() {
    this.mediaCapture
      .captureImage({
        limit: 1
      })
      .then(pictures => {
        const file = new AttachFile(pictures[0]);
        this.attachedFiles = [...this.attachedFiles, file];
      });
  }

  attachFile(files: FileList) {
    const parsedFiles = Array.from(files).map(
      file =>
        new AttachFile({
          name: file.name,
          type: file.type,
          size: file.size,
          path: this.sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(file)
          )
        })
    );

    this.attachedFiles = [...this.attachedFiles, ...parsedFiles];
  }

  async previewFile(file: AttachFile) {
    console.log(this.attachedFiles);
    const modal = await this.modalController.create({
      component: FilePreviewComponent,
      componentProps: {
        file: file
      },
      showBackdrop: true
    });

    modal.present();
  }
}
