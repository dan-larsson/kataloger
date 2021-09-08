import { Component } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Directory } from './directory.model';
import { Tree } from './tree.model';
import { NgbTypeaheadConfig, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

const root: Tree = new Tree({
  id:"",
  name: "",
  checked:false,
  children: [
    new Tree({
      id:"1", // c:
      name: "C:",
      checked:false,
      children: [
        new Tree({
          id:"2", // c:/lorem
          name: "lorem",
          checked:false,
          children: [
            new Tree({
              id:"3", // c:/lorem/ipsum
              name: "ipsum",
              checked:false,
              children: [
                new Tree({
                  id:"4", // c:/lorem/ipsum/dolor
                  name: "dolor",
                  checked: false,
                  children: []
                })
              ]
            }),
            new Tree({
              id:"5", // c:/lorem/perspiciatis
              name: "perspiciatis",
              checked: false,
              children: [
                new Tree({
                  id:"6", // c:/lorem/perspiciatis/accusantium
                  name: "accusantium",
                  checked: false,
                  children: []
                })
              ]
            }),
            new Tree({
              id:"7", // c:/lorem/accusantium
              name: "accusantium",
              checked: false,
              children: [
                new Tree({
                  id:"10", // c:/lorem/accusantium/simsalabim
                  name: "simsalabim",
                  checked: false,
                  children: [
                    new Tree({
                      id:"100", // c:/lorem/accusantium/simsalabim/imsevimse
                      name: "imsevimse",
                      checked: false,
                      children: [
                        new Tree({
                          id:"101", // c:/lorem/accusantium/simsalabim/imsevimse/spindel
                          name: "spindel",
                          checked: true,
                          children: []
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Tree({
      id:"200", // f:
      name: "F:",
      checked:false,
      children: [
        new Tree({
          id:"201", // f:\hemligt
          name: "hemligt",
          checked:false,
          children: []
        })
      ]
    })
  ]
});

const dirs: Directory[] = [
  {
    id: "1", 
    name: "C:", 
    path: ['C:'],
  },
  {
    id: "2", 
    name: "C:\\lorem", 
    path: ['C:', 'lorem'],
  },
  {
    id: "3", 
    name: "C:\\lorem\\ipsum", 
    path: ['C:', 'lorem', 'ipsum'],
  },
  {
    id: "4", 
    name: "C:\\lorem\\ipsum\\dolor", 
    path: ['C:', 'lorem', 'ipsum', 'dolor'],
  },
  {
    id: "5", 
    name: "C:\\lorem\\perspiciatis", 
    path: ['C:', 'lorem', 'perspiciatis'],
  },
  {
    id: "6", 
    name: "C:\\lorem\\perspiciatis\\accusantium", 
    path: ['C:', 'lorem', 'perspiciatis', 'accusantium'],
  },
  {
    id: "7", 
    name: "C:\\lorem\\accusantium", 
    path: ['C:', 'lorem', 'accusantium'],
  },
  {
    id: "10",
    name: "C:\\lorem\\accusantium\\simsalabim", 
    path: ['C:', 'lorem', 'accusantium', 'simsalabim'],
  },
  {
    id: "100", 
    name: "C:\\lorem\\accusantium\\simsalabim\\imsevimse", 
    path: ['C:', 'lorem', 'accusantium', 'simsalabim', 'imsevimse'],
  },
  {
    id: "101", 
    name: "C:\\lorem\\accusantium\\simsalabim\\imsevimse\\spindel", 
    path: ['C:', 'lorem', 'accusantium', 'simsalabim', 'imsevimse', 'spindel'],
  },
  {
    id: "200", 
    name: "F:", 
    path: ['F:'],
  },
  {
    id: "201", 
    name: "F:\\hemligt", 
    path: ['F:', 'hemligt'],
  }
]

@Component({
  selector: 'app-directory-view',
  templateUrl: './directory-view.component.html',
  styleUrls: ['./directory-view.component.css'],
  providers: [NgbTypeaheadConfig]
})
export class DirectoryViewComponent {
  private initialDirectories: Directory[] = []
  public selectedDirectories: Directory[] = []
  
  public model: any;
  public hasChanged = false

  constructor(config: NgbTypeaheadConfig) {
    config.showHint = false;
    root.getSelectedTree(root).forEach((id) => {
      let dir:any = this.findInDirectories(id)
      if (dir) {
        this.initialDirectories.push(dir)
        this.selectedDirectories.push(dir)
      }
    })
    this.checkForChange()
  }

  public resetSelected(): void {
    this.selectedDirectories = []
    this.initialDirectories.forEach(val => this.selectedDirectories.push(Object.assign({}, val)));
    this.checkForChange()
  }

  private checkForChange():void {
    var result = this.initialDirectories.filter( (o1) => {
      return this.selectedDirectories.some(function (o2) {
        return o1.id === o2.id;
      });
    })
    this.hasChanged = (
      (this.initialDirectories.length !== this.selectedDirectories.length)
      || (result.length !== this.initialDirectories.length))
  }

  search: OperatorFunction<string, readonly Directory[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => term === '' ? []
        : dirs.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  formatter = (x: {name: string}) => x.name;

  selectedItem(event:NgbTypeaheadSelectItemEvent) {
    this.addDirectory(event.item)
    this.checkForChange()
    this.clear()
  }

  clear(){
    setTimeout(()=>{
      this.model = '';
    }, 1);
  }

  exists(dir:Directory): boolean { 
    let results:Directory[] = this.selectedDirectories.filter(e => e.name === dir.name);
    let allGood:boolean = true
    
    if (results.length) {
      for (var result of results) {
        if (dir.path.length !== result.path.length) {
          continue
        }
        allGood = true
        for (var index in dir.path) {
          if (result.path[index] !== dir.path[index]) {
            allGood = false
            break
          }
        }
        if (allGood) {
          return true
        }
      }      
    }
    return false
  }

  private addDirectory(dir:Directory): void {
    let tree:any = this.findInTree(dir)
    if (tree) {
      tree.setChecked(true)
      this.getSubDirs(tree).forEach((dir) => {
        if (!this.exists(dir)) {
          this.selectedDirectories.push(dir)
        }
      })
      this.sort()
      this.checkForChange()
    }
    else {
      console.log("Could not find in tree: "+ dir.name)
    }
  }

  private sort():void {
    this.selectedDirectories = this.selectedDirectories.sort((obj1, obj2) => {
      if (obj1.name > obj2.name) {
          return 1;
      }
      if (obj1.name < obj2.name) {
          return -1;
      }
      return 0;
    });
  }

  public getSubDirs(input: Tree, output: Directory[] = []): Directory[] {
    let needle:any
    if (input.checked) {
        needle = this.findInDirectories(input.id)
        if (needle) {
          output.push(needle);
        }
    }
    input.children.forEach((node) => {
        this.getSubDirs(node, output);
    });
    return output;
  }

  private findInDirectories(id:string): Directory|undefined {
    return dirs.find((e: { id: string; }) => e.id === id)
  }

  private findInTree(dir:Directory): Tree|undefined {
    let parent:any = root
    for (var level of dir.path) {
      parent = parent.children.find((e: { name: string; }) => e.name === level);
      if (!parent) {
        return undefined
      } 
    }
    return parent
  }

  public removeDirectory(dir:Directory): void {
    let current:any = root
    let parent:any = undefined
    for (var level of dir.path) {
      parent = current
      current = current.children.find((e: { name: string; }) => e.name === level);
      if (!current) {
        return undefined
      }
      
    }
    if (current) {
      this.getSubDirs(current).forEach((dir) => {
        this.selectedDirectories = this.selectedDirectories.filter(
          e => e.id !== dir.id
        );
      })
      current.setChecked(false)
      let selected:string[] = parent.getSelectedTree(current)
      if (!selected.length) {
        this.selectedDirectories = this.selectedDirectories.filter(
          e => e.id !== parent.id
        );
        parent.setChecked(false)
      }
      this.sort()
      this.checkForChange()
    }
  }
}