class Camera {
    constructor(cameraPosition, target, up) {
        this.cameraPosition = {
            x: cameraPosition[0],
            y: cameraPosition[1],
            z: cameraPosition[2]
        };

        this.target = {
            x: target[0],
            y: target[1],
            z: target[2]
        };

        this.up = [...up];
    }

    computeMatrix() {
        let cameraMatrix = m4.lookAt(convertObjectToArray(this.cameraPosition), convertObjectToArray(this.target), this.up)
        
        let viewMatrix = m4.inverse(cameraMatrix);

        return viewMatrix
    }
}