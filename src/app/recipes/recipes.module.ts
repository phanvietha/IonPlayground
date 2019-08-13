import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RecipesPage } from './recipes.page';
import { SharedModule } from '../shared/shared.module';

import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { Media } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';

const routes: Routes = [
  {
    path: '',
    component: RecipesPage
  }
];

@NgModule({
  imports: [
    SharedModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RecipesPage],
  providers: [
    MediaCapture,
    Media,
    File
  ]
})
export class RecipesPageModule {}
