import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  animations: []
})

export class DetailsComponent implements OnInit {

  constructor(private service:SharedService, private route:ActivatedRoute ) { }

  Animal:any = null;
  isLoaded:boolean = false;

  ngOnInit(): void {
    this.refreshAnimalList();
  }

  refreshAnimalList(){
    const routeParams = this.route.snapshot.paramMap;
    const animalId = Number(routeParams.get('id'));
      this.service.getAnimalbyId(animalId).subscribe(data=>{
        this.Animal=data;
        //we need that so that rendering of view waits with build until data e.g. image is loaded
        this.isLoaded = true;
      });
  }

  scrollToBottom() {
    const element = document.getElementById("scrollParent");
    console.log('clicked on scroll');
    (element as HTMLElement).scrollTo(0, (element as HTMLElement).scrollHeight);
  }

}
