export class Tree {
    id: string = ""
    name: string = ""
    children: Tree[] = []
    checked: boolean = false
    
    constructor(init?:Partial<Tree>) {
      Object.assign(this, init);
    }

    public isRoot(): boolean {
        return this.id === "";
    }
    
    public setChecked(value: boolean) {
        this.checked = value;
        this.children.forEach((obj) => {
            obj.setChecked(value);
        });
    }

    public hasChildren(): boolean {
        return this.children.length > 0;
    }

    public getSelectedTree(input: Tree, output: string[] = []): string[] {
        if (input.checked) {
            output.push(input.id);
        }
        input.children.forEach((node) => {
            node.getSelectedTree(node, output);
        });
        return output;
    }
}