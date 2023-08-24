import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  readonly APIUrl = "http://127.0.0.1:8000";


  constructor(private http:HttpClient) { }

  getAnimals():Observable<any[]>{
    console.log('fetching all entries from server')
    return this.http.get<any[]>(this.APIUrl + '/animal/');
  }

  getAnimalbyId(id:number):Observable<any[]>{
    console.log('fetching one specific entrie from server')
    return this.http.get<any[]>(this.APIUrl + '/animal/' + id);
  }
}
