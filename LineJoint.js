class LineJoint {
    constructor(p0, p1, isSpring, springConstant) {
        this.p0 = p0;
        this.p1 = p1;
        this.length = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
        this.cut = false;

        this.isSpring = isSpring;
        this.springConstant = springConstant;

        p0.num_of_joints++;
        p1.num_of_joints++;

        p0.joints.push(this);
        p1.joints.push(this);

        p0.connectedPoints.push(p1);
        p1.connectedPoints.push(p0);
    }

    update() {
        if (this.cut) return;

        //joint is fixed
        if (!this.isSpring) {
            // get euclidean distance between 2 points
            let dx = this.p1.x - this.p0.x;
            let dy = this.p1.y - this.p0.y;
            let distPoints = Math.sqrt(dx * dx + dy * dy);

            //percentage of the length changed
            let percent = (((this.length - distPoints) / distPoints) / 2);

            let offset_x = dx * percent //(percent / 100 * SPRINGJOINTFORCE);
            let offset_y = dy * percent //(percent / 100 * SPRINGJOINTFORCE);

            if (!this.p0.anchored) {

                this.p0.x -= offset_x;
                this.p0.y -= offset_y;
            }

            if (!this.p1.anchored) {

                this.p1.x += offset_x;
                this.p1.y += offset_y;
            }
            return;
        }

        // get euclidean distance between 2 points
        let dx = this.p1.x - this.p0.x;
        let dy = this.p1.y - this.p0.y;
        let distPoints = Math.sqrt(dx * dx + dy * dy);

        let diff = this.length - distPoints;

        let springForce = diff * this.springConstant;

        if (!this.p0.anchored) {
            let dir0 = createVector(this.p0.x - this.p1.x, this.p0.y - this.p1.y).normalize();
            dir0.mult(springForce)
            this.p0.applyForce(dir0);
        }

        if (!this.p1.anchored) {
            let dir1 = createVector(this.p1.x - this.p0.x, this.p1.y - this.p0.y).normalize();
            dir1.mult(springForce)
            this.p1.applyForce(dir1);
        }

    }

    show() {
        if (this.cut) return;
        if (this.isSpring) {
            stroke(255);
            strokeWeight(this.springConstant);
        } else {
            strokeWeight(2);
            stroke(0, 0, 255);
        };
        line(this.p0.x, this.p0.y, this.p1.x, this.p1.y);
    }

    cutJoint(x, y) {
        //percentage of dist of (x, y) to p0 of the joint length
        let t_int = (Math.sqrt((x - this.p0.x) ** 2 + (y - this.p0.y) ** 2)) / this.length;

        if (t_int > 1) return;

        let p0 = createVector(this.p0.x, this.p0.y);
        let p1 = createVector(this.p1.x, this.p1.y);

        //use linear interpolation of the percentage of (x, y) to get the coord on the line
        let lineCoord = p5.Vector.lerp(p0, p1, t_int);

        if (dist(x, y, lineCoord.x, lineCoord.y) < 8) {
            this.cut = true;
            this.p0.num_of_joints--;
            this.p1.num_of_joints--;
            this.p0.joints.splice(this.p0.joints.indexOf(this), 1);
            this.p1.joints.splice(this.p1.joints.indexOf(this), 1);

            this.p0.connectedPoints.splice(this.p0.connectedPoints.indexOf(this.p1), 1);
            this.p1.connectedPoints.splice(this.p1.connectedPoints.indexOf(this.p0), 1);
        }

    }

    cutThisJoint() {
        this.cut = true;
    }
}