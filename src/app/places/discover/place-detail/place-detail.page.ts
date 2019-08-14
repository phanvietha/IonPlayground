import { Component, OnInit } from "@angular/core";
import { NavController, ModalController } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { PlacesService } from "../../places.service";
import { Place } from "../../place.model";
import { CreateBookingComponent } from "src/app/bookings/create-booking/create-booking.component";

@Component({
  selector: "app-place-detail",
  templateUrl: "./place-detail.page.html",
  styleUrls: ["./place-detail.page.scss"]
})
export class PlaceDetailPage implements OnInit {
  place: Place;

  constructor(
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has("placeId")) {
        this.navController.navigateBack("/places/tabs/offers");
        return;
      }

      this.place = this.placesService.getPlace(paramMap.get("placeId"));
    });
  }

  back() {
    // this.navController.pop();
    this.navController.navigateBack("/places/tabs/discover");
  }

  onBook() {
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place }
      })
      .then(modalElement => {
        modalElement.present();
        return modalElement.onDidDismiss();
      })
      .then(result => {
        console.log(result);
      });
  }
}
