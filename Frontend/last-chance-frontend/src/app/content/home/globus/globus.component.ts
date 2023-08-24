import { Component, OnInit, Input } from '@angular/core';
import Globe from 'globe.gl';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Router } from '@angular/router';
import { AmbientLight, DirectionalLight, PerspectiveCamera } from 'three';
import { SharedService } from 'src/app/services/shared.service';

//structure of the data which is displayed on the globe
export interface GlobeData {
  lat: number;
  lng: number;
  size: number;
  color: string;
  type: string;
  name: string;
  danger_level: string;
  text: string;
  cause_of_danger: string;
  image: string;
  dropdownOpen: boolean;
  domElement: HTMLElement;
};

//structure of the points on the globe
//here we use it to define the start middle point of the scene
export interface GlobePoints {
  lat: number;
  lng: number;
  altitude: number;
};

@Component({
  selector: 'app-globus',
  templateUrl: './globus.component.html',
  animations: []
})

export class GlobusComponent implements OnInit {

  //texture paths
  @Input() public texture: string = "/assets/world_texture.jpg";
  @Input() public displacement_map: string = "/assets/world_displacement.jpg";
  @Input() public ambient_occ_map: string = "/assets/world_ambientocclusion.jpg";
  @Input() public normal_map: string = "/assets/world_normal2.jpg";
  @Input() public roughness_map: string = "/assets/world_roughness.jpg";
  @Input() public bg_stars: string = "/assets/world_stars.jpg";
  @Input() public cloud_img: string = "/assets/world_clouds.png";
  @Input() public sun_img: string = "/assets/world_sun.png";

  //texture loader is needed to load the png/jpg pictures into the material as textures
  private loader = new THREE.TextureLoader();

  //Material which embeds the textures above
  private material = new THREE.MeshStandardMaterial({
      map: this.loader.load(this.texture),
      displacementMap: this.loader.load(this.displacement_map),
      displacementScale: 0,
      normalMap: this.loader.load(this.normal_map),
      roughnessMap: this.loader.load(this.roughness_map),
      aoMap: this.loader.load(this.ambient_occ_map)
    });

  // lighting in the scene
  private lightFront: THREE.RectAreaLight = new THREE.RectAreaLight(0xc3cef7, 1, 300, 300);
  private lightBack: THREE.RectAreaLight = new THREE.RectAreaLight(0xfae7c8, 1, 300, 300);

  // data
  AnimalList:any = [];

  //determines the starting point
  private altitude: number = 3.5;
  private MAP_CENTER: GlobePoints = ({ lat: 30, lng: 9.10, altitude: this.altitude });

  //determines the display window
  public w = window.innerWidth;
  public shiftFactor = 0.45;
  public shiftAmmount:number = this.shiftFactor * this.w;
  public h = window.innerHeight;
  public shiftFactorHeight = 0.85;
  public shiftAmountHeight:number = this.shiftFactorHeight * this.h;

  //public dropDownOpen:boolean = false;


  constructor(private router:Router, private service:SharedService) { }

  ngOnInit(): void {
    this.refreshAnimalList();
  }
  
  /**
   * update from database
   */
  refreshAnimalList(){
    this.service.getAnimals().subscribe(data=>{
     this.AnimalList=data;

     //create scene after the request to the server is finished
     this.createScene();
    });
  }

  /**
   * create the 3D-Scene with the Globe.GL UI-Component in it
  */
  private createScene() {
    
    //globe gl instance
    const myGlobe = Globe();

    //add globe gl instance to html globeContainer element
    //also add the stars and atmosphere
    const myDOMElement = document.getElementById('globeContainer')!;
    myGlobe(myDOMElement)
      .showAtmosphere(true)
      .atmosphereAltitude(0.25)
      .atmosphereColor('#03a9fc')
      .globeMaterial(this.material);

    //add clouds to globe
    const clouds_altitude = 0.0015;
    const clouds_rotation_speed = -0.05;
    const clouds = new THREE.Mesh(
      new THREE.SphereBufferGeometry(myGlobe.getGlobeRadius() * (1 + clouds_altitude), 75, 75),
      new THREE.MeshPhongMaterial({
        map: this.loader.load(this.cloud_img),
        transparent: true,
        color:0xffffff,
        emissive: 0xffffff,
        emissiveIntensity:1,
        side: THREE.DoubleSide
      })
    );
    myGlobe.scene().add(clouds);

    (function rotateClouds() {
      clouds.rotation.y += clouds_rotation_speed * Math.PI / 180;
      requestAnimationFrame(rotateClouds);
    })();

    /**
    * shift the globe to the left and down
    * this is a workaround because the globe.gl library always places the globe in the middle of the scene
    */
    myGlobe.width(this.w + this.shiftAmmount).height(this.h + this.shiftAmountHeight);
    myDOMElement.style.setProperty('margin-left', -this.shiftAmmount + 'px');

    //adjust camera
    var cam = myGlobe.camera() as PerspectiveCamera;
    cam.setFocalLength(50);
    myGlobe.camera.apply(cam);

    //adjust controls
    var controls = myGlobe.controls() as OrbitControls;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    myGlobe.controls.apply(controls);

    //IMPORTANT: link lights to camera; else they would rotate with the orbitControls and we don't want that
    //add area light on the top right back of the scene
    this.lightBack.position.set( 700, 400, -300 );
    this.lightBack.castShadow = true;
    this.lightBack.intensity = 35;
    this.lightBack.lookAt( 0, 0, 0 );
    myGlobe.camera().add(this.lightBack);

    //add area light on the bottom left front of the scene
    this.lightFront.position.set( -400, -200, 100 );
    this.lightFront.castShadow = true;
    this.lightFront.intensity = 4;
    this.lightFront.lookAt( 0, 0, 0 );
    myGlobe.camera().add(this.lightFront);

    //add stars as bg
    const planeGeo = new THREE.PlaneGeometry(240, 135);
    const planeMat = new THREE.MeshBasicMaterial({map: this.loader.load(this.bg_stars),
      side: THREE.DoubleSide});
    const starsPlane = new THREE.Mesh(planeGeo, planeMat);
    starsPlane.position.set(50, 30, -500);
    myGlobe.camera().add(starsPlane);

    //add sun as fg
    const planeGeo2 = new THREE.PlaneGeometry(13, 12)
    const planeMat2 = new THREE.MeshBasicMaterial({map: this.loader.load(this.sun_img),
      transparent: true,
      side: THREE.DoubleSide});
    const sunPlane = new THREE.Mesh(planeGeo2, planeMat2);
    sunPlane.position.set(9, 4.5, -50);
    myGlobe.camera().add(sunPlane);

    myGlobe.scene().add(myGlobe.camera());

    //start point of view
    myGlobe.pointOfView(this.MAP_CENTER, 0);

    //add data to the globe
    //add an html element at each data point
    myGlobe.htmlElementsData(this.AnimalList)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.className = 'bdd_wrapper';
      
      const elImg = document.createElement('img');
      elImg.src = "/assets/button_icon.svg";
      elImg.id = 'button';
      el.appendChild(elImg);
      elImg.className = 'dd_button';

      this.createHTMLElement(d, el);
      (d as GlobeData).domElement = el;

      elImg.onclick = () => {

        //make button orange
        elImg.src = "/assets/button_icon_orange.svg"; 

        myGlobe.htmlElement(newObj => {
          if((newObj as GlobeData).dropdownOpen && newObj != d){
            this.closeDropDown(newObj as GlobeData);
          }
          return (newObj as GlobeData).domElement;
        })

        if(!(d as GlobeData).dropdownOpen){

          (d as GlobeData).dropdownOpen = true;
          this.openDropDown(d);

          //stop globus from rotating on click
          controls.autoRotate = false;
          myGlobe.controls.apply(controls);

          var new_center: GlobePoints = ({ lat: (d as GlobeData).lat - 22, lng:  (d as GlobeData).lng -12, altitude: this.altitude });
          myGlobe.pointOfView(new_center, 400);

        } else {

          this.closeDropDown(d as GlobeData);
          controls.autoRotate = true;
          myGlobe.controls.apply(controls);

        }

        //elevate the open data point to make sure that it is always in front of others
        myGlobe.htmlAltitude(el => {
          if((el as GlobeData).dropdownOpen) {
            return 0.1;
          }
          else return 0;
        })
      };
    
      return el;
    })
    .htmlTransitionDuration(0)
    

    //remove default lights of globe.gl ui-component
    myGlobe.scene().onAfterRender = () => {
      myGlobe.scene().children.forEach( function (child) {
        if( child instanceof AmbientLight) {
          myGlobe.scene().remove(child);
        }
        if( child instanceof DirectionalLight) {
          myGlobe.scene().remove(child);
        }
      });
    }
    myGlobe.scene().updateMatrix;
   
  }

  //create the HTML element for the data points
  private createHTMLElement(d:any, el:HTMLElement) {

    const detailsWindow = document.createElement('div');
    detailsWindow.className = 'dd_container';
    detailsWindow.id = 'dropdown';
    detailsWindow.style.display = 'none';

    el.appendChild(detailsWindow);

    detailsWindow.style.pointerEvents = 'auto';
    detailsWindow.style.cursor = 'pointer';
    detailsWindow.onclick = () => {
      this.router.navigateByUrl('/details/' + d.id);
    };

    //header of dropDown
    const dd_header = document.createElement('div');
    dd_header.className = 'dd_header';
    detailsWindow.appendChild(dd_header);
    const dd_title = document.createElement('h3');
    dd_title.innerHTML = d.name.toUpperCase();
    dd_title.className = 'dd_title';
    dd_header.appendChild(dd_title);

    //image
    const dd_img = document.createElement('img');
    dd_img.className = 'dd_img';
    dd_img.src = d._image;
    detailsWindow.appendChild(dd_img);

    //text
    const dd_text = document.createElement('div');
    dd_text.className = 'dd_text';
    dd_text.innerHTML = d.text;
    detailsWindow.appendChild(dd_text);
  }

  //open the drop down at a certain data point
  private openDropDown(d:any) {
    var el = d.domElement;
     //show on click DropDown
    var ddElement = el.querySelector("#dropdown");
    if(ddElement != null){
      (ddElement as HTMLElement).style.display = 'block';
    }
    el.className = "bdd_wrapper2";
  }

  //close the drop down at a certain data point
  private closeDropDown(d:any) {

    (d as GlobeData).dropdownOpen = false;

    var el = d.domElement;

    el.className = "bdd_wrapper";
    //show on click DropDown
    var ddElement = el.querySelector("#dropdown");
    if(ddElement != null){
      (ddElement as HTMLElement).style.display = 'none';
    }

    var elImg = el.querySelector("#button");
    if(elImg != null){
        elImg.src = "/assets/button_icon.svg";
    }
 }
}
