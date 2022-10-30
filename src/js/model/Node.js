class Node {
    constructor(source) {
        this.children = [];
        this.localMatrix = m4.identity();
        this.worldMatrix = m4.identity();
        this.source = source;
    }

    setParent(parent) {
        if (this.parent) {
            var ndx = this.parent.children.indexOf(this);

            if (ndx >= 0) 
                this.parent.children.splice(ndx, 1);
        }

        if (parent) 
            parent.children.push(this);
        
        this.parent = parent;
    }

    updateWorldMatrix(matrix) {
        let source = this.source

        if (source) 
            source.getMatrix(this.localMatrix)
        
        if (matrix) 
            m4.multiply(matrix, this.localMatrix, this.worldMatrix)
        else 
            m4.copy(this.localMatrix, this.worldMatrix)
        
        let worldMatrix = this.worldMatrix

        this.children.forEach(child => child.updateWorldMatrix(worldMatrix))
    }
}