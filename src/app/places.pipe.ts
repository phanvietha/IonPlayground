import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'places'
})
export class PlacesPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return null;
  }

}
