import { Component, OnInit } from "@angular/core";
import { NavParams, ModalController } from "@ionic/angular";
import { Place } from "src/app/places/place.model";

@Component({
  selector: "app-create-booking",
  templateUrl: "./create-booking.component.html",
  styleUrls: ["./create-booking.component.scss"]
})
export class CreateBookingComponent implements OnInit {
  place: Place;
  constructor(
    private navParam: NavParams,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.place = this.navParam.get("selectedPlace");
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onBooking() {
    this.modalCtrl.dismiss({message: 'yay'}, 'confirm')
  }
}
